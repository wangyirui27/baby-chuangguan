#!/usr/bin/env python3
"""Build simple topology guides so Dreamina varies island structure, not only theme."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "islands-v1" / "layout-guides"
SIZE = 1024
WATER = "#17233d"
SAND = "#a9a9a9"
LAND = "#f7f7f2"
REEF = "#555b66"


def canvas():
    image = Image.new("RGB", (SIZE, SIZE), WATER)
    return image, ImageDraw.Draw(image)


def save(number, draw_fn):
    image, draw = canvas()
    draw_fn(draw)
    image.save(OUT / f"island-{number:03d}-layout.png", optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base, draw = canvas()
    draw.rounded_rectangle((125, 630, 899, 740), 10, fill="#7fd9dd")
    draw.rounded_rectangle((125, 710, 899, 900), 10, fill="#214d75")
    draw.line(((125, 710), (899, 710)), fill="#c7f4ee", width=12)
    base.save(OUT / "rectangular-base-guide.png", optimize=True)

    save(1, lambda d: (
        d.rounded_rectangle((115, 175, 909, 850), 260, fill=SAND),
        d.ellipse((170, 205, 500, 700), fill=LAND),
        d.ellipse((524, 205, 854, 700), fill=LAND),
        d.rounded_rectangle((275, 470, 749, 740), 120, fill=LAND),
        d.ellipse((340, 535, 684, 875), fill=WATER),
        d.ellipse((175, 755, 225, 805), fill=REEF),
        d.ellipse((235, 790, 270, 825), fill=REEF),
        d.ellipse((285, 812, 310, 837), fill=REEF),
    ))

    save(2, lambda d: (
        d.ellipse((115, 115, 909, 909), fill=SAND),
        d.ellipse((190, 190, 834, 834), fill=LAND),
        d.ellipse((300, 300, 724, 724), fill="#dddddd"),
        d.ellipse((355, 355, 669, 669), fill=LAND),
        d.pieslice((410, 720, 614, 930), 180, 360, fill=WATER),
        d.ellipse((400, 118, 432, 150), fill=REEF),
        d.ellipse((492, 100, 530, 138), fill=REEF),
        d.ellipse((590, 122, 616, 148), fill=REEF),
    ))

    save(4, lambda d: (
        d.pieslice((110, 250, 914, 1050), 180, 360, fill=SAND),
        d.rounded_rectangle((160, 310, 864, 760), 130, fill=LAND),
        d.rounded_rectangle((250, 235, 774, 625), 110, fill="#dddddd"),
        d.rounded_rectangle((345, 165, 679, 475), 90, fill=LAND),
        d.ellipse((190, 770, 220, 800), fill=REEF),
        d.ellipse((265, 805, 285, 825), fill=REEF),
        d.ellipse((750, 785, 778, 813), fill=REEF),
    ))

    save(5, lambda d: (
        d.ellipse((115, 140, 909, 900), fill=SAND),
        d.ellipse((185, 205, 839, 825), fill=LAND),
        d.pieslice((310, 525, 714, 955), 180, 360, fill=WATER),
        d.ellipse((190, 770, 245, 825), fill=REEF),
        d.ellipse((786, 755, 830, 799), fill=REEF),
    ))

    save(6, lambda d: (
        d.rounded_rectangle((130, 330, 894, 720), 70, fill=SAND),
        d.rounded_rectangle((315, 130, 709, 915), 70, fill=SAND),
        d.rounded_rectangle((180, 375, 844, 675), 55, fill=LAND),
        d.rounded_rectangle((360, 180, 664, 865), 55, fill=LAND),
        d.rounded_rectangle((420, 300, 604, 660), 40, fill="#dddddd"),
        d.rectangle((170, 710, 220, 760), fill=REEF),
        d.rectangle((795, 245, 835, 285), fill=REEF),
    ))

    save(7, lambda d: (
        d.polygon(((512, 100), (835, 480), (615, 690), (545, 940), (479, 940), (409, 690), (189, 480)), fill=SAND),
        d.polygon(((512, 170), (760, 475), (575, 635), (535, 840), (489, 840), (449, 635), (264, 475)), fill=LAND),
        d.polygon(((512, 720), (548, 930), (476, 930)), fill="#dddddd"),
        d.polygon(((555, 890), (585, 945), (525, 945)), fill=REEF),
    ))

    save(8, lambda d: (
        d.ellipse((105, 170, 919, 900), fill=SAND),
        d.ellipse((180, 225, 844, 825), fill=LAND),
        d.ellipse((315, 350, 709, 760), fill=WATER),
        d.rectangle((390, 610, 634, 930), fill=WATER),
        d.ellipse((735, 205, 785, 255), fill=REEF),
        d.ellipse((800, 265, 832, 297), fill=REEF),
    ))

    save(9, lambda d: (
        d.ellipse((310, 100, 714, 520), fill=SAND),
        d.ellipse((105, 390, 515, 835), fill=SAND),
        d.ellipse((509, 390, 919, 835), fill=SAND),
        d.ellipse((355, 155, 669, 475), fill=LAND),
        d.ellipse((165, 440, 485, 780), fill=LAND),
        d.ellipse((539, 440, 859, 780), fill=LAND),
        d.ellipse((385, 610, 639, 875), fill=WATER),
        d.ellipse((715, 770, 750, 805), fill=REEF),
        d.ellipse((755, 750, 780, 775), fill=REEF),
        d.ellipse((790, 725, 808, 743), fill=REEF),
    ))

    save(10, lambda d: (
        d.polygon(((105, 275), (480, 150), (500, 850), (125, 745)), fill=SAND),
        d.polygon(((919, 275), (544, 150), (524, 850), (899, 745)), fill=SAND),
        d.polygon(((165, 310), (468, 215), (485, 760), (180, 690)), fill=LAND),
        d.polygon(((859, 310), (556, 215), (539, 760), (844, 690)), fill=LAND),
        d.polygon(((492, 170), (532, 170), (545, 915), (479, 915)), fill="#dddddd"),
    ))


if __name__ == "__main__":
    main()
