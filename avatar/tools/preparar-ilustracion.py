"""
Prepara una ilustración para el avatar 2.5D:
  - la redimensiona a 1069 × 1472 (el tamaño de la original)
  - recorta el fondo blanco (solo el conectado con el borde, así no se
    borran la camiseta ni las zapatillas) → <nombre>.webp con transparencia
  - genera su mapa de profundidad → <nombre>-depth.png
      · con IA (Depth Anything V2) si está instalada: relieve real
      · si no, con zonas aproximadas (más pobre, pero sin dependencias)

Uso (desde la carpeta avatar/):
    pip install pillow numpy scipy
    pip install torch transformers          # opcional: profundidad con IA
    python tools/preparar-ilustracion.py mi-dibujo-saludando.png assets/serena-saludo

"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

W, H = 1069, 1472


def main(src, out):
    img = Image.open(src).convert('RGB').resize((W, H), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32)

    # 1) Fondo = píxeles casi blancos conectados con el borde de la imagen
    white = a.min(axis=2) > 236
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ndi.binary_opening(~np.isin(lab, list(border)), iterations=1)
    alpha = np.clip(ndi.gaussian_filter(fg.astype(np.float32), 0.8) * 1.05, 0, 1)
    Image.fromarray(np.dstack([a, alpha * 255]).astype(np.uint8), 'RGBA') \
        .save(out + '.webp', 'WEBP', quality=90, method=6)

    # 2) Profundidad
    try:
        d = depth_ia(img, fg.astype(np.float32))
        print('Profundidad: IA (Depth Anything V2)')
    except ImportError:
        d = depth_zonas(fg)
        print('Profundidad: zonas aproximadas (instala torch + transformers para usar IA)')
    Image.fromarray((d * 255).astype(np.uint8), 'L').resize((W // 2, H // 2), Image.BILINEAR) \
        .save(out + '-depth.png')
    print('Listo:', out + '.webp', 'y', out + '-depth.png')


_PIPE = None


def depth_ia(img, fg):
    """Depth Anything V2 (small) + limpieza para que el paralaje no "desgarre"."""
    global _PIPE
    if _PIPE is None:
        from transformers import pipeline
        _PIPE = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf')
    pipe = _PIPE
    d = pipe(img.resize((756, int(756 * H / W))))['predicted_depth']
    d = np.asarray(Image.fromarray(np.asarray(d.squeeze().numpy(), np.float32)).resize((W, H), Image.BICUBIC))
    v = d[fg > 0.5]
    lo, hi = np.percentile(v, 2), np.percentile(v, 98)
    d = np.clip((d - lo) / (hi - lo), 0, 1)
    # fuera de la figura se extiende la profundidad del borde
    ext = ndi.gaussian_filter(d * fg, 12) / (ndi.gaussian_filter(fg, 12) + 1e-4)
    d = d * fg + ext * (1 - fg)
    d = ndi.gaussian_filter(d, 2.0)
    d = ndi.grey_closing(d, size=(5, 5))    # quita las líneas finas del dibujo
    d = ndi.grey_dilation(d, size=(9, 9))   # lo cercano desborda un poco su contorno
    return np.clip(ndi.gaussian_filter(d, 3.5), 0, 1)


def depth_zonas(fg):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

    def blob(cx, cy, rx, ry, amp):
        return amp * np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2))

    d = np.full((H, W), 0.30, np.float32)
    d += blob(470, 560, 260, 300, 0.12)   # torso
    d += blob(450, 240, 130, 170, 0.40)   # cabeza
    d += blob(490, 270, 45, 45, 0.10)     # nariz / mejillas
    d += blob(330, 70, 70, 60, 0.10)      # moño
    d += blob(700, 850, 300, 230, 0.50)   # portátil
    d += blob(250, 1150, 230, 180, 0.35)  # rodillas
    d += blob(850, 1130, 230, 180, 0.35)
    d += blob(500, 1300, 350, 130, 0.30)  # pies
    m = fg.astype(np.float32)
    d = ndi.gaussian_filter(ndi.gaussian_filter(d * m, 22) / (ndi.gaussian_filter(m, 22) + 1e-4), 6)
    return (d - d.min()) / (d.max() - d.min())


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
