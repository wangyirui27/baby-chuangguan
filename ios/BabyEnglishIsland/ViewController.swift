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

final class IslandViewController: UIViewController, WKScriptMessageHandler, SKProductsRequestDelegate, SKPaymentTransactionObserver {
  private let vipProductId = "baby_island_map_vip_001"
  private var webView: WKWebView!
  private var productRequest: SKProductsRequest?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground

    let contentController = WKUserContentController()
    contentController.add(WeakScriptMessageHandler(self), name: "babyIslandIAP")
    contentController.add(WeakScriptMessageHandler(self), name: "babyIslandAppUpdate")

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

    SKPaymentQueue.default().add(self)
    loadBundledApp()
  }

  deinit {
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "babyIslandIAP")
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "babyIslandAppUpdate")
    SKPaymentQueue.default().remove(self)
  }

  private func loadBundledApp() {
    guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
      return
    }
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    if message.name == "babyIslandAppUpdate" {
      openStore(from: message.body)
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
