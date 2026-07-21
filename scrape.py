import os
import re
import json
import time
import hashlib
import csv
from urllib.parse import urljoin, urlparse, unquote

import requests
from bs4 import BeautifulSoup, NavigableString, Comment

BASE = "https://www.colegioesquiu.edu.ar"
ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(ROOT, "imagenes")
TXT_DIR = os.path.join(ROOT, "textos")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(TXT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 EsquiuScraper/1.0 (+contacto escolar)"
}

PAGES = [
    ("/", "inicio"),
    ("/admision", "admision"),
    ("/proyecto-pedagógico", "proyecto-pedagogico"),
    ("/areas-transversales-1", "areas-transversales"),
    ("/copia-de-ed-fisica", "educacion-fisica"),
    ("/copia-de-ingles", "ingles"),
    ("/copia-de-pastoral", "pastoral"),
    ("/copia-de-pastoral-1", "pastoral-1"),
    ("/servicios", "servicios"),
    ("/equipo", "equipo"),
    ("/comisión-directiva", "comision-directiva"),
    ("/exalumnos", "exalumnos"),
    ("/general-6", "general-6"),
    ("/blank-1", "blank-1"),
    ("/contacto", "contacto"),
    ("/gracias", "gracias"),
]

session = requests.Session()
session.headers.update(HEADERS)

image_rows = []
seen_image_ids = {}  # wix media id -> filename (dedupe across pages)


def fetch(url):
    for attempt in range(3):
        try:
            r = session.get(url, timeout=30)
            r.raise_for_status()
            return r.text
        except Exception as e:
            print(f"  retry {attempt+1} for {url}: {e}")
            time.sleep(2)
    return None


def clean_text_blocks(soup):
    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()

    blocks = []
    seen = set()
    for el in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "blockquote", "span"]):
        # skip if this element's own direct text is empty (avoid duplicate parent/child text)
        text = el.get_text(" ", strip=True)
        if not text or len(text) < 2:
            continue
        # avoid counting a block whose full text is already contained in a block we kept
        # (rough de-dup by exact string)
        key = text
        if key in seen:
            continue
        seen.add(key)
        tagname = el.name
        blocks.append((tagname, text))
    return blocks


def wix_original_url(src):
    """Strip Wix transform params to get the highest-res original image."""
    m = re.match(r"(https://static\.wixstatic\.com/media/[^/]+)", src)
    if m:
        return m.group(1)
    return src


def guess_category(page_slug, alt_text, url):
    alt_l = (alt_text or "").lower()
    url_l = url.lower()
    if "instagram" in alt_l or "icon" in url_l or "alt_text_label" in url_l:
        return "icono"
    if page_slug == "inicio" and ("logo" in url_l or "8ed443f00de44518b9de3c3eb52358f4" in url_l):
        return "logo"
    if "logo" in alt_l:
        return "logo"
    return f"foto-{page_slug}"


def sanitize_filename(name):
    name = unquote(name)
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name[:120]


def process_images(soup, page_slug, page_url):
    count = 0
    candidates = []

    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        srcset = img.get("srcset") or img.get("data-srcset")
        alt = img.get("alt", "").strip()
        if not src and srcset:
            src = srcset.split(",")[0].strip().split(" ")[0]
        if not src:
            continue
        candidates.append((src, alt))

    # background-image: url(...) in inline styles
    for el in soup.find_all(style=True):
        style = el["style"]
        for m in re.finditer(r'background-image:\s*url\(["\']?([^"\')]+)', style):
            candidates.append((m.group(1), el.get("aria-label", "") or ""))

    for src, alt in candidates:
        if not src:
            continue
        src = urljoin(page_url, src)
        if "static.wixstatic.com/media/" not in src and "wixstatic.com" not in src:
            continue

        m = re.search(r"/media/([^/]+~mv2\.[a-zA-Z0-9]+|[a-f0-9]{32}\.[a-zA-Z0-9]+)", src)
        media_id = m.group(1) if m else hashlib.md5(src.encode()).hexdigest()

        orig_url = wix_original_url(src)

        if media_id in seen_image_ids:
            # already downloaded; just record an additional occurrence/context if alt is richer
            continue

        ext = os.path.splitext(media_id)[1] or ".jpg"
        base_name = sanitize_filename(media_id)
        filename = base_name
        filepath = os.path.join(IMG_DIR, filename)

        try:
            resp = session.get(orig_url, timeout=30)
            resp.raise_for_status()
            with open(filepath, "wb") as f:
                f.write(resp.content)
            size_bytes = len(resp.content)
        except Exception as e:
            print(f"  ! error descargando {orig_url}: {e}")
            continue

        seen_image_ids[media_id] = filename
        category = guess_category(page_slug, alt, src)
        image_rows.append({
            "archivo": filename,
            "pagina_origen": page_slug,
            "url_pagina": page_url,
            "url_imagen_original": orig_url,
            "texto_alternativo": alt,
            "categoria": category,
            "tamano_bytes": size_bytes,
        })
        count += 1
        print(f"  imagen guardada: {filename} ({size_bytes} bytes) [{category}]")
    return count


all_pages_text = {}

for path, slug in PAGES:
    url = urljoin(BASE, path)
    print(f"Descargando página: {url}")
    html = fetch(url)
    if html is None:
        print(f"  ! no se pudo descargar {url}")
        continue
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""
    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_desc = meta_desc_tag["content"].strip() if meta_desc_tag and meta_desc_tag.get("content") else ""

    n_imgs = process_images(BeautifulSoup(html, "html.parser"), slug, url)

    blocks = clean_text_blocks(soup)
    all_pages_text[slug] = {
        "url": url,
        "titulo": title,
        "meta_descripcion": meta_desc,
        "bloques": blocks,
        "n_imagenes_nuevas": n_imgs,
    }

    # write per-page text file
    txt_path = os.path.join(TXT_DIR, f"{slug}.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"URL: {url}\n")
        f.write(f"TITULO: {title}\n")
        if meta_desc:
            f.write(f"META DESCRIPCION: {meta_desc}\n")
        f.write("\n--- CONTENIDO ---\n\n")
        for tag, text in blocks:
            f.write(f"[{tag}] {text}\n")

    time.sleep(1)

# write image metadata CSV
csv_path = os.path.join(IMG_DIR, "metadata_imagenes.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "archivo", "pagina_origen", "url_pagina", "url_imagen_original",
        "texto_alternativo", "categoria", "tamano_bytes"
    ])
    writer.writeheader()
    for row in image_rows:
        writer.writerow(row)

# also JSON version
json_path = os.path.join(IMG_DIR, "metadata_imagenes.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(image_rows, f, ensure_ascii=False, indent=2)

# dump all page text as JSON too, for downstream synthesis
with open(os.path.join(TXT_DIR, "_todas_las_paginas.json"), "w", encoding="utf-8") as f:
    json.dump(all_pages_text, f, ensure_ascii=False, indent=2)

print(f"\nListo. {len(image_rows)} imágenes únicas descargadas. {len(all_pages_text)} páginas procesadas.")
