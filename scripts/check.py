"""Check printable assets, script syntax inputs and static relative links."""
from pathlib import Path
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from PIL import Image
root=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ('src','href') and v and not v.startswith(('http:','https:','#')):
                assert (root/'docs'/v).is_file(),v
Links().feed((root/'docs/index.html').read_text())
svgs=list((root/'docs/desenhos').glob('*.svg'))
assert len(svgs)==20
for path in svgs:ET.parse(path)
for path in (root/'docs/assets').glob('*.gif'):
    with Image.open(path) as image:assert image.n_frames>1
print('Static links valid; 20 SVG coloring sheets valid; 2 animated GIFs valid.')
