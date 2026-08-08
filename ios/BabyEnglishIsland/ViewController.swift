import StoreKit
import UIKit
import WebKit

final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
  weak var target: WKScriptMessageHandler?

  init(_ target: WKScriptMessageHandler) {
    self.target = target
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    target?.userContentController(userContentController, didReceive: message)
  }
}

final class AssetPackDownloadManager: NSObject, URLSessionDownloadDelegate {
  static var backgroundCompletionHandler: (() -> Void)?

  private struct PackRecord: Codable {
    var mapId: String
    var levelId: Int?
    var status: String
    var progress: Int
    var bytesDone: Int64
    var bytesTotal: Int64
    var downloadUrl: String
    var localUrl: String?
    var localVersion: String
    var remoteVersion: String
    var errorCode: String
    var updatedAt: TimeInterval
  }

  private struct LevelQueueItem {
    var levelId: Int
    var downloadUrl: String
    var remoteVersion: String
  }

  private weak var webView: WKWebView?
  private var records: [String: PackRecord] = [:]
  private var tasks: [String: URLSessionDownloadTask] = [:]
  private var taskMapIds: [Int: String] = [:]
  private var levelQueues: [String: [LevelQueueItem]] = [:]

  private lazy var session: URLSession = {
    let bundleId = Bundle.main.bundleIdentifier ?? "com.baobaoenglish.island"
    let config = URLSessionConfiguration.background(withIdentifier: "\(bundleId).assetpacks")
    config.sessionSendsLaunchEvents = true
    config.allowsCellularAccess = true
    config.isDiscretionary = false
    return URLSession(configuration: config, delegate: self, delegateQueue: nil)
  }()

  override init() {
    super.init()
    records = loadRecords()
  }

  func attach(_ webView: WKWebView) {
    self.webView = webView
  }

  func handle(_ body: Any) {
    guard let payload = body as? [String: Any] else {
      emit(failedRecord(mapId: "ocean", errorCode: "bad_payload"))
      return
    }
    let action = ((payload["action"] as? String) ?? "list").lowercased()
    if action == "list" {
      records.values.forEach(emit)
      return
    }
    guard let mapId = sanitizedMapId(payload["mapId"] as? String) else {
      emit(failedRecord(mapId: "ocean", errorCode: "bad_map_id"))
      return
    }
    let normalizedAction = action
      .replacingOccurrences(of: "levelvideo", with: "")
      .replacingOccurrences(of: "level", with: "")
    let levelQueue = parseLevelQueue(from: payload, mapId: mapId)
    if !levelQueue.isEmpty {
      switch normalizedAction {
      case "start", "resume":
        startLevelQueue(mapId: mapId, queue: levelQueue)
      case "pause":
        pauseActiveLevelDownload(mapId: mapId)
      case "cancel":
        cancelActiveLevelDownload(mapId: mapId)
      default:
        emit(failedRecord(mapId: mapId, errorCode: "bad_action"))
      }
      return
    }
    let rawLevelId = payload["levelId"] as? Int ?? Int((payload["levelId"] as? String) ?? "")
    let isLevelVideo = action.contains("level") || rawLevelId != nil
    let levelId = isLevelVideo ? sanitizedLevelId(rawLevelId) : nil
    if isLevelVideo && levelId == nil {
      emit(failedRecord(mapId: mapId, levelId: 0, errorCode: "bad_level_id"))
      return
    }
    let key = recordKey(mapId: mapId, levelId: levelId)
    switch normalizedAction {
    case "start":
      start(key: key, mapId: mapId, levelId: levelId, payload: payload)
    case "pause":
      pause(key: key, mapId: mapId, levelId: levelId)
    case "resume":
      resume(key: key, mapId: mapId, levelId: levelId)
    case "cancel":
      cancel(key: key, mapId: mapId, levelId: levelId)
    default:
      emit(failedRecord(mapId: mapId, levelId: levelId, errorCode: "bad_action"))
    }
  }

  private func start(key: String, mapId: String, levelId: Int?, payload: [String: Any]) {
    guard tasks[key] == nil else {
      if let record = records[key] { emit(record) }
      return
    }
    let rawUrl = (payload["downloadUrl"] as? String) ?? ""
    guard let url = URL(string: rawUrl), ["https", "http"].contains(url.scheme?.lowercased() ?? "") else {
      save(record: failedRecord(mapId: mapId, levelId: levelId, errorCode: "missing_url"))
      return
    }
    var record = records[key] ?? defaultRecord(mapId: mapId, levelId: levelId)
    record.status = "downloading"
    record.downloadUrl = rawUrl
    record.remoteVersion = (payload["remoteVersion"] as? String) ?? record.remoteVersion
    record.errorCode = ""
    record.updatedAt = Date().timeIntervalSince1970
    save(record: record)

    let task = session.downloadTask(with: url)
    task.taskDescription = key
    tasks[key] = task
    taskMapIds[task.taskIdentifier] = key
    task.resume()
  }

  private func startLevelQueue(mapId: String, queue: [LevelQueueItem]) {
    levelQueues[mapId] = queue
    startNextQueuedLevel(mapId: mapId)
  }

  private func startNextQueuedLevel(mapId: String) {
    if let activeKey = activeLevelDownloadKey(mapId: mapId) {
      if let record = records[activeKey] { emit(record) }
      return
    }
    guard let queue = levelQueues[mapId] else { return }
    guard let next = queue.first(where: { item in
      records[recordKey(mapId: mapId, levelId: item.levelId)]?.status != "ready"
    }) else {
      var record = records[mapId] ?? defaultRecord(mapId: mapId, levelId: nil)
      record.status = "ready"
      record.progress = 100
      record.errorCode = ""
      record.updatedAt = Date().timeIntervalSince1970
      save(record: record)
      return
    }
    start(
      key: recordKey(mapId: mapId, levelId: next.levelId),
      mapId: mapId,
      levelId: next.levelId,
      payload: ["downloadUrl": next.downloadUrl, "remoteVersion": next.remoteVersion]
    )
  }

  private func activeLevelDownloadKey(mapId: String) -> String? {
    tasks.keys
      .filter { key in
        guard let record = records[key] else { return false }
        return record.mapId == mapId && record.levelId != nil
      }
      .sorted { left, right in
        (records[left]?.levelId ?? 0) < (records[right]?.levelId ?? 0)
      }
      .first
  }

  private func pauseActiveLevelDownload(mapId: String) {
    guard let key = activeLevelDownloadKey(mapId: mapId),
          let record = records[key],
          let levelId = record.levelId
    else {
      var record = records[mapId] ?? defaultRecord(mapId: mapId, levelId: nil)
      record.status = "paused"
      save(record: record)
      return
    }
    pause(key: key, mapId: mapId, levelId: levelId)
  }

  private func cancelActiveLevelDownload(mapId: String) {
    guard let key = activeLevelDownloadKey(mapId: mapId),
          let record = records[key],
          let levelId = record.levelId
    else {
      var record = records[mapId] ?? defaultRecord(mapId: mapId, levelId: nil)
      record.status = "not-installed"
      record.progress = 0
      save(record: record)
      return
    }
    cancel(key: key, mapId: mapId, levelId: levelId)
  }

  private func pause(key: String, mapId: String, levelId: Int?) {
    guard let task = tasks[key] else {
      var record = records[key] ?? defaultRecord(mapId: mapId, levelId: levelId)
      record.status = "paused"
      save(record: record)
      return
    }
    task.cancel { [weak self] resumeData in
      DispatchQueue.main.async {
        guard let self else { return }
        if let resumeData, let root = try? self.ensureStorage() {
          try? resumeData.write(to: self.resumeDataURL(for: key, root: root), options: .atomic)
        }
        self.tasks[key] = nil
        self.taskMapIds[task.taskIdentifier] = nil
        var record = self.records[key] ?? self.defaultRecord(mapId: mapId, levelId: levelId)
        record.status = "paused"
        record.updatedAt = Date().timeIntervalSince1970
        self.save(record: record)
      }
    }
  }

  private func resume(key: String, mapId: String, levelId: Int?) {
    guard tasks[key] == nil else {
      if let record = records[key] { emit(record) }
      return
    }
    guard let root = try? ensureStorage() else {
      save(record: failedRecord(mapId: mapId, levelId: levelId, errorCode: "storage_unavailable"))
      return
    }
    let resumeUrl = resumeDataURL(for: key, root: root)
    if let resumeData = try? Data(contentsOf: resumeUrl) {
      let task = session.downloadTask(withResumeData: resumeData)
      task.taskDescription = key
      tasks[key] = task
      taskMapIds[task.taskIdentifier] = key
      var record = records[key] ?? defaultRecord(mapId: mapId, levelId: levelId)
      record.status = "downloading"
      record.errorCode = ""
      save(record: record)
      task.resume()
      return
    }
    start(key: key, mapId: mapId, levelId: levelId, payload: ["downloadUrl": records[key]?.downloadUrl ?? "", "remoteVersion": records[key]?.remoteVersion ?? ""])
  }

  private func cancel(key: String, mapId: String, levelId: Int?) {
    tasks[key]?.cancel()
    tasks[key] = nil
    if let root = try? ensureStorage() {
      try? FileManager.default.removeItem(at: resumeDataURL(for: key, root: root))
    }
    var record = records[key] ?? defaultRecord(mapId: mapId, levelId: levelId)
    record.status = "not-installed"
    record.progress = 0
    record.bytesDone = 0
    record.bytesTotal = 0
    record.updatedAt = Date().timeIntervalSince1970
    save(record: record)
  }

  func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didWriteData bytesWritten: Int64,
    totalBytesWritten: Int64,
    totalBytesExpectedToWrite: Int64
  ) {
    guard let key = recordKey(for: downloadTask) else { return }
    DispatchQueue.main.async {
      var record = self.records[key] ?? self.defaultRecord(mapId: "ocean", levelId: nil)
      record.status = "downloading"
      record.bytesDone = totalBytesWritten
      record.bytesTotal = max(0, totalBytesExpectedToWrite)
      record.progress = totalBytesExpectedToWrite > 0 ? Int((Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)) * 100) : record.progress
      record.errorCode = ""
      record.updatedAt = Date().timeIntervalSince1970
      self.save(record: record)
    }
  }

  func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
    guard let key = recordKey(for: downloadTask), let root = try? ensureStorage() else { return }
    var current = records[key] ?? defaultRecord(mapId: "ocean", levelId: nil)
    let target = localFileURL(for: current, root: root)
    do {
      try FileManager.default.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true)
      try? FileManager.default.removeItem(at: target)
      try FileManager.default.moveItem(at: location, to: target)
      try? FileManager.default.removeItem(at: resumeDataURL(for: key, root: root))
      DispatchQueue.main.async {
        var record = current
        record.status = "ready"
        record.progress = 100
        record.bytesDone = max(record.bytesDone, record.bytesTotal)
        record.localUrl = target.absoluteString
        record.localVersion = record.remoteVersion
        record.errorCode = ""
        record.updatedAt = Date().timeIntervalSince1970
        self.tasks[key] = nil
        self.taskMapIds[downloadTask.taskIdentifier] = nil
        self.save(record: record)
        if record.levelId != nil {
          self.startNextQueuedLevel(mapId: record.mapId)
        }
      }
    } catch {
      DispatchQueue.main.async {
        self.save(record: self.failedRecord(mapId: current.mapId, levelId: current.levelId, errorCode: "move_failed"))
      }
    }
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    guard let key = recordKey(for: task) else { return }
    DispatchQueue.main.async {
      self.tasks[key] = nil
      self.taskMapIds[task.taskIdentifier] = nil
      guard let error else { return }
      let nsError = error as NSError
      if nsError.code == NSURLErrorCancelled {
        return
      }
      if let resumeData = nsError.userInfo[NSURLSessionDownloadTaskResumeData] as? Data,
         let root = try? self.ensureStorage() {
        try? resumeData.write(to: self.resumeDataURL(for: key, root: root), options: .atomic)
      }
      let record = self.records[key] ?? self.defaultRecord(mapId: "ocean", levelId: nil)
      self.save(record: self.failedRecord(mapId: record.mapId, levelId: record.levelId, errorCode: "download_failed"))
    }
  }

  func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
    DispatchQueue.main.async {
      AssetPackDownloadManager.backgroundCompletionHandler?()
      AssetPackDownloadManager.backgroundCompletionHandler = nil
    }
  }

  private func sanitizedMapId(_ value: String?) -> String? {
    guard let value, value.range(of: #"^[A-Za-z0-9_-]{1,40}$"#, options: .regularExpression) != nil else { return nil }
    return value
  }

  private func sanitizedLevelId(_ value: Int?) -> Int? {
    guard let value, (1...200).contains(value) else { return nil }
    return value
  }

  private func parseLevelQueue(from payload: [String: Any], mapId: String) -> [LevelQueueItem] {
    guard let rawItems = payload["levelQueue"] as? [[String: Any]] else { return [] }
    var seen = Set<Int>()
    return rawItems.compactMap { item -> LevelQueueItem? in
      let rawLevelId = item["levelId"] as? Int ?? Int((item["levelId"] as? String) ?? "")
      guard let levelId = sanitizedLevelId(rawLevelId), !seen.contains(levelId) else { return nil }
      let rawUrl = (item["downloadUrl"] as? String) ?? ""
      guard let url = URL(string: rawUrl), ["https", "http"].contains(url.scheme?.lowercased() ?? "") else { return nil }
      seen.insert(levelId)
      return LevelQueueItem(
        levelId: levelId,
        downloadUrl: rawUrl,
        remoteVersion: (item["remoteVersion"] as? String) ?? (payload["remoteVersion"] as? String) ?? ""
      )
    }.sorted { $0.levelId < $1.levelId }
  }

  private func recordKey(mapId: String, levelId: Int?) -> String {
    if let levelId {
      return "level-\(mapId)-\(levelId)"
    }
    return mapId
  }

  private func recordKey(for task: URLSessionTask) -> String? {
    task.taskDescription ?? taskMapIds[task.taskIdentifier]
  }

  private func defaultRecord(mapId: String, levelId: Int?) -> PackRecord {
    PackRecord(
      mapId: mapId,
      levelId: levelId,
      status: "not-installed",
      progress: 0,
      bytesDone: 0,
      bytesTotal: 0,
      downloadUrl: "",
      localUrl: nil,
      localVersion: "",
      remoteVersion: "",
      errorCode: "",
      updatedAt: Date().timeIntervalSince1970
    )
  }

  private func failedRecord(mapId: String, levelId: Int? = nil, errorCode: String) -> PackRecord {
    let key = recordKey(mapId: mapId, levelId: levelId)
    var record = records[key] ?? defaultRecord(mapId: mapId, levelId: levelId)
    record.status = "failed"
    record.errorCode = errorCode
    record.updatedAt = Date().timeIntervalSince1970
    return record
  }

  private func save(record: PackRecord) {
    records[recordKey(mapId: record.mapId, levelId: record.levelId)] = record
    persistRecords()
    emit(record)
  }

  private func emit(_ record: PackRecord) {
    var payload: [String: Any] = [
      "mapId": record.mapId,
      "status": record.status,
      "progress": record.progress,
      "bytesDone": record.bytesDone,
      "bytesTotal": record.bytesTotal,
      "downloadUrl": record.downloadUrl,
      "localUrl": record.localUrl ?? "",
      "localVersion": record.localVersion,
      "remoteVersion": record.remoteVersion,
      "errorCode": record.errorCode,
      "updatedAt": record.updatedAt,
    ]
    if let levelId = record.levelId {
      payload["levelId"] = levelId
    }
    guard
      let data = try? JSONSerialization.data(withJSONObject: payload),
      let json = String(data: data, encoding: .utf8)
    else { return }
    let callback = record.levelId == nil ? "babyIslandAssetPackEvent" : "babyIslandLevelVideoEvent"
    DispatchQueue.main.async { [weak self] in
      self?.webView?.evaluateJavaScript("window.\(callback) && window.\(callback)(\(json));")
    }
  }

  private func ensureStorage() throws -> URL {
    let root = FileManager.default
      .urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("BabyIslandAssetPacks", isDirectory: true)
    try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    return root
  }

  private func stateURL(root: URL) -> URL {
    root.appendingPathComponent("state.json")
  }

  private func resumeDataURL(for key: String, root: URL) -> URL {
    root.appendingPathComponent("\(key).resumeData")
  }

  private func localFileURL(for record: PackRecord, root: URL) -> URL {
    if let levelId = record.levelId {
      return root
        .appendingPathComponent("levels", isDirectory: true)
        .appendingPathComponent(record.mapId, isDirectory: true)
        .appendingPathComponent("level-\(String(format: "%03d", levelId)).mp4")
    }
    return root.appendingPathComponent("\(record.mapId).pack")
  }

  private func loadRecords() -> [String: PackRecord] {
    guard
      let root = try? ensureStorage(),
      let data = try? Data(contentsOf: stateURL(root: root)),
      let records = try? JSONDecoder().decode([String: PackRecord].self, from: data)
    else { return [:] }
    return records
  }

  private func persistRecords() {
    guard
      let root = try? ensureStorage(),
      let data = try? JSONEncoder().encode(records)
    else { return }
    try? data.write(to: stateURL(root: root), options: .atomic)
  }
}

final class IslandViewController: UIViewController, WKScriptMessageHandler, SKProductsRequestDelegate, SKPaymentTransactionObserver {
  private let vipProductId = "baby_island_map_vip_001"
  private let assetPackManager = AssetPackDownloadManager()
  private var webView: WKWebView!
  private var productRequest: SKProductsRequest?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground

    let contentController = WKUserContentController()
    contentController.addUserScript(Self.appMetadataScript())
    contentController.add(WeakScriptMessageHandler(self), name: "babyIslandIAP")
    contentController.add(WeakScriptMessageHandler(self), name: "babyIslandAppUpdate")
    contentController.add(WeakScriptMessageHandler(self), name: "babyIslandAssetPack")

    let config = WKWebViewConfiguration()
    config.userContentController = contentController
    config.allowsInlineMediaPlayback = true
    if #available(iOS 10.0, *) {
      config.mediaTypesRequiringUserActionForPlayback = []
    }

    let webView = WKWebView(frame: .zero, configuration: config)
    webView.translatesAutoresizingMaskIntoConstraints = false
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    view.addSubview(webView)
    NSLayoutConstraint.activate([
      webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      webView.topAnchor.constraint(equalTo: view.topAnchor),
      webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])
    self.webView = webView
    assetPackManager.attach(webView)

    SKPaymentQueue.default().add(self)
    loadBundledApp()
  }

  deinit {
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "babyIslandIAP")
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "babyIslandAppUpdate")
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "babyIslandAssetPack")
    SKPaymentQueue.default().remove(self)
  }

  private func loadBundledApp() {
    guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
      return
    }
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
  }

  private static func appMetadataScript() -> WKUserScript {
    let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0.0"
    let build = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? ""
    let apiBase = shellConfigApiBase()
    let disableLocalMock = shellConfigAllowLocalMockLogin() ? "false" : "true"
    // Inject version + production API origin before any H5 script runs (file:// has no host).
    let source = """
    window.BABY_ISLAND_APP_VERSION = \(jsonString(version));
    window.BABY_ISLAND_BUILD_NUMBER = \(jsonString(build));
    window.BABY_ISLAND_API_BASE = \(jsonString(apiBase));
    window.BABY_ISLAND_DISABLE_LOCAL_MOCK = \(disableLocalMock);
    (function () {
      var base = window.BABY_ISLAND_API_BASE;
      if (!base) return;
      function apply() {
        if (window.babyIslandApi && typeof window.babyIslandApi.setApiBase === 'function') {
          window.babyIslandApi.setApiBase(base);
          return true;
        }
        return false;
      }
      if (!apply()) {
        document.addEventListener('DOMContentLoaded', function () { apply(); });
        setTimeout(apply, 0);
        setTimeout(apply, 50);
        setTimeout(apply, 250);
      }
    })();
    """
    return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
  }

  /// Reads bundled `shell-config.json` → `apiBase` (HTTPS origin, no trailing slash).
  private static func shellConfigApiBase() -> String {
    let object = shellConfigObject()
    let raw = (object["apiBase"] as? String) ?? ""
    var trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    while trimmed.hasSuffix("/") {
      trimmed = String(trimmed.dropLast())
    }
    return trimmed
  }

  private static func shellConfigAllowLocalMockLogin() -> Bool {
    shellConfigObject()["allowLocalMockLogin"] as? Bool == true
  }

  private static func shellConfigObject() -> [String: Any] {
    guard
      let url = Bundle.main.url(forResource: "shell-config", withExtension: "json"),
      let data = try? Data(contentsOf: url),
      let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else {
      return [:]
    }
    return object
  }

  private static func jsonString(_ value: String) -> String {
    guard
      let data = try? JSONEncoder().encode(value),
      let json = String(data: data, encoding: .utf8)
    else { return "\"\"" }
    return json
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    if message.name == "babyIslandAppUpdate" {
      openStore(from: message.body)
      return
    }
    if message.name == "babyIslandAssetPack" {
      assetPackManager.handle(message.body)
      return
    }
    if message.name == "babyIslandIAP" {
      startPurchase(from: message.body)
    }
  }

  private func openStore(from body: Any) {
    guard
      let payload = body as? [String: Any],
      let rawUrl = payload["updateUrl"] as? String,
      let url = URL(string: rawUrl),
      ["https", "itms-apps"].contains(url.scheme?.lowercased() ?? "")
    else { return }

    UIApplication.shared.open(url)
  }

  private func startPurchase(from body: Any) {
    guard
      let payload = body as? [String: Any],
      let productId = payload["productId"] as? String,
      productId == vipProductId
    else { return }

    if payload["action"] as? String == "restore" {
      SKPaymentQueue.default().restoreCompletedTransactions()
      return
    }

    guard SKPaymentQueue.canMakePayments() else { return }

    productRequest?.cancel()
    let request = SKProductsRequest(productIdentifiers: [productId])
    request.delegate = self
    productRequest = request
    request.start()
  }

  func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
    productRequest = nil
    guard let product = response.products.first(where: { $0.productIdentifier == vipProductId }) else {
      return
    }
    SKPaymentQueue.default().add(SKPayment(product: product))
  }

  func request(_ request: SKRequest, didFailWithError error: Error) {
    productRequest = nil
  }

  func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
    for transaction in transactions {
      switch transaction.transactionState {
      case .purchased, .restored:
        completeVipPurchase()
        queue.finishTransaction(transaction)
      case .failed:
        queue.finishTransaction(transaction)
      case .purchasing, .deferred:
        break
      @unknown default:
        queue.finishTransaction(transaction)
      }
    }
  }

  private func completeVipPurchase() {
    let js = """
    window.BabyIslandIAPComplete && window.BabyIslandIAPComplete();
    window.babyIslandIAPComplete && window.babyIslandIAPComplete();
    """
    webView.evaluateJavaScript(js)
  }
}
