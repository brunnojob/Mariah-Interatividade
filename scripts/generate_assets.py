"""Generate original vector coloring sheets and gentle README animations."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
ROOT = Path(__file__).resolve().parents[1]
D = ROOT/'docs/desenhos'
D.mkdir(parents=True, exist_ok=True)
drawings = [
('Sol','<circle cx="200" cy="210" r="80"/>'+''.join(f'<path d="M{200+102*math.cos(a):.1f} {210+102*math.sin(a):.1f} L{200+135*math.cos(a):.1f} {210+135*math.sin(a):.1f}"/>' for a in [i*math.pi/6 for i in range(12)])),
('Lua','<path d="M260 80C75 65 55 320 230 345C290 350 335 315 350 275C200 335 120 145 260 80Z"/>'),
('Estrela','<path d="m200 65 42 95 106 10-80 70 25 109-93-56-93 56 25-109-80-70 106-10Z"/>'),
('Nuvem','<path d="M95 300C20 290 30 185 95 185C95 80 255 70 280 180C365 145 390 300 305 300Z"/>'),
('Arco-íris','<path d="M45 300C45 50 355 50 355 300ZM90 300C90 115 310 115 310 300ZM135 300C135 180 265 180 265 300Z"/>'),
('Flor','<path d="M200 235V365M200 325Q110 250 105 320Q145 365 200 345M200 295Q290 225 295 290Q250 335 200 315"/><circle cx="200" cy="110" r="46"/><circle cx="260" cy="153" r="46"/><circle cx="238" cy="221" r="46"/><circle cx="162" cy="221" r="46"/><circle cx="140" cy="153" r="46"/><circle cx="200" cy="167" r="43"/>'),
('Árvore','<path d="M175 260V370H225V260"/><path d="M110 280C25 270 35 180 95 165C55 65 190 40 210 100C290 25 365 125 310 180C395 230 325 315 265 278C220 325 155 315 110 280Z"/>'),
('Maçã','<path d="M200 135C65 55 45 195 95 290C135 375 175 340 200 340C230 340 265 375 305 290C355 195 335 55 200 135ZM200 132Q185 75 220 60M210 100Q240 30 300 70Q265 135 210 100Z"/>'),
('Pera','<path d="M180 105C150 145 165 180 115 220C20 300 100 365 200 365C300 365 380 300 285 220C235 180 250 145 220 105Q200 85 180 105ZM200 100Q190 60 220 45"/>'),
('Banana','<path d="M85 105C115 300 250 320 315 95L340 108C335 370 105 410 60 125Z"/><path d="M85 125C150 345 290 290 325 115"/>'),
('Bola','<circle cx="200" cy="210" r="135"/><path d="M90 135Q200 220 310 135M90 285Q200 200 310 285M200 75Q110 210 200 345M200 75Q290 210 200 345"/>'),
('Pipa','<path d="m200 65 110 125-110 125L90 190ZM200 65V315M90 190H310M200 315Q155 350 225 385M185 335l-28-12 5 30Z"/>'),
('Barco','<path d="M55 265H345L285 340H115ZM200 65V265M185 85 75 245H185ZM215 125l100 120H215ZM40 365q40-25 80 0t80 0t80 0t80 0"/>'),
('Casa','<path d="m55 185 145-115 145 115ZM85 185V350H315V185M175 350V250H235V350"/><rect x="110" y="220" width="45" height="45" rx="4"/>'),
('Peixe','<path d="M295 205 360 135V285L295 225C170 390 25 235 65 205C25 175 170 20 295 205Z"/><path d="M220 125Q175 210 220 295"/><circle cx="120" cy="180" r="9"/>'),
('Borboleta','<path d="M185 205C55 15 10 175 120 215C-10 310 120 395 185 250M215 205C345 15 390 175 280 215C410 310 280 395 215 250"/><ellipse cx="200" cy="235" rx="18" ry="85"/><path d="M192 157q-40-60-50-20M208 157q40-60 50-20"/>'),
('Caracol','<path d="M70 305H300Q365 305 350 250Q330 215 310 260L300 300M320 240V195M345 240l15-40"/><circle cx="170" cy="220" r="100"/><path d="M200 290C70 290 90 125 190 160C250 180 205 270 165 230C140 205 175 185 185 210"/>'),
('Urso','<circle cx="105" cy="115" r="48"/><circle cx="295" cy="115" r="48"/><circle cx="200" cy="220" r="125"/><circle cx="155" cy="195" r="7"/><circle cx="245" cy="195" r="7"/><ellipse cx="200" cy="260" rx="55" ry="43"/><path d="m180 240 20 20 20-20ZM200 260v20M175 282q25 25 50 0"/>'),
('Coelho','<ellipse cx="145" cy="110" rx="37" ry="85"/><ellipse cx="255" cy="110" rx="37" ry="85"/><ellipse cx="200" cy="260" rx="120" ry="100"/><circle cx="155" cy="240" r="7"/><circle cx="245" cy="240" r="7"/><path d="m180 265 20 20 20-20ZM200 285v15M165 300q35 35 70 0M100 275H55M105 295 60 315M300 275h45M295 295l45 20"/>'),
('Tartaruga','<ellipse cx="355" cy="240" rx="32" ry="40"/><ellipse cx="120" cy="315" rx="35" ry="20"/><ellipse cx="270" cy="315" rx="35" ry="20"/><path d="M65 290C25 80 335 65 325 290ZM70 280l-35 10 35 10"/><path d="m200 135 55 60-15 70h-80l-15-70ZM145 195l-65-20M255 195l55-20M160 265l-40 25M240 265l40 25"/><circle cx="360" cy="230" r="4"/>')]
for i,(title,body) in enumerate(drawings,1):
    (D/f'{i:02}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" role="img" aria-labelledby="title"><title id="title">{title} para colorir</title><rect width="400" height="440" fill="white"/><g fill="white" stroke="#161616" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>')
assets=ROOT/'docs/assets'
(assets/'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#0e7d7a"/><text x="32" y="46" font-size="48" font-family="Georgia" text-anchor="middle" fill="#f4cf68">m</text></svg>')
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f=lambda size:ImageFont.truetype(font,size)
b=lambda size:ImageFont.truetype(bold,size)
frames=[]
for t in range(48):
    im=Image.new('RGB',(1100,350),'#f6f4e9');d=ImageDraw.Draw(im)
    d.text((55,40),'MARIAH',font=b(16),fill='#0e7d7a')
    d.text((55,90),'Pequenas descobertas.',font=b(38),fill='#233d3c')
    d.text((55,150),'Uma voz. Um toque. Um mundo inteiro.',font=f(23),fill='#61706b')
    d.text((55,235),'Prepare aqui. Brinque junto, fora da tela.',font=f(17),fill='#0e7d7a')
    for i,c in enumerate(['#d9835b','#efc94f','#6a9c85']):
        x=780+i*100;y=155+int(7*math.sin(t/48*math.pi*2+i))
        if i==0:d.ellipse((x-35,y-35,x+35,y+35),fill=c)
        elif i==1:d.rounded_rectangle((x-35,y-35,x+35,y+35),8,fill=c)
        else:d.polygon([(x,y-40),(x-40,y+35),(x+40,y+35)],fill=c)
    d.line((55,312,1045,312),fill='#dce1d3',width=2)
    frames.append(im)
frames[0].save(assets/'mariah.gif',save_all=True,append_images=frames[1:],duration=110,loop=1,optimize=True)
frames=[]
labels=['1. Escolha uma brincadeira','2. Imprima ou prepare os objetos','3. Guarde o aparelho e brinque']
for stage in range(3):
    im=Image.new('RGB',(1100,180),'#eaf0e8');d=ImageDraw.Draw(im)
    for i,label in enumerate(labels):
        x=30+i*355
        d.rounded_rectangle((x,30,x+330,145),15,fill='#0e7d7a' if stage==i else '#fdfbf3')
        color='white' if stage==i else '#233d3c'
        d.text((x+18,55),label.split('. ')[0],font=b(18),fill=color)
        words=label.split('. ')[1].split(' ');line='';lines=[]
        for word in words:
            if len(line+' '+word)>26:lines.append(line);line=word
            else:line=(line+' '+word).strip()
        lines.append(line)
        d.multiline_text((x+18,85),'\n'.join(lines),font=f(17),fill=color,spacing=5)
    frames.append(im)
frames[0].save(assets/'brincar.gif',save_all=True,append_images=frames[1:],duration=1800,loop=1)
print('20 SVGs, favicon and 2 animated GIFs generated.')
