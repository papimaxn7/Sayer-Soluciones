---
name: tablero-sayer
description: Actualiza el Tablero SayerPro (ventas, egresos, rentabilidad por sucursal, efectivo, compras Sayer y proveedores) con el libro SAYER VENTAS y los Resúmenes de Venta de un periodo, y da el diagnóstico del periodo.
---

# Tablero SayerPro — actualización y diagnóstico

Carga un periodo nuevo (normalmente un mes cerrado) al **Tablero SayerPro** de Max y le entrega el diagnóstico del periodo. El tablero acumula todos los meses cargados, así que funcionan las comparaciones contra el periodo anterior y las agrupaciones por semana, mes, bimestre, trimestre, semestre y año.

- Tablero actual: https://claude.ai/artifact/3agULZhc6PG8htZ6BXZRka (artifact de tipo Dashboard, datos guardados como archivos JSON adjuntos).
- Entradas: el libro **SAYER VENTAS** (.xlsx con VENTAS AL DIA, SAYER FRIDA PAGOS y PROVEDORES) y los **Resúmenes de Venta** de Santa Rosa, Cuautepec y Tlalne (.xlsx o .xls) del periodo. Los mismos archivos de la skill `conciliacion-mensual-sayer`; si se corrieron juntas en la conversación, reutilízalos.

## Las 7 pestañas del tablero (ya construidas; no se rehacen)

1. **Resumen ejecutivo**: venta, utilidad estimada, compras, egresos, cancelaciones, efectivo depositado; diagnóstico con semáforo; cascada de la venta a la utilidad; venta por periodo y sucursal.
2. **Ventas**: venta por periodo, formas de pago (monto, % y operaciones), venta por vendedor, venta promedio por día de la semana, cancelaciones (global vs error) y devoluciones, principales clientes.
3. **Egresos de tienda**: por categoría, sucursal × categoría (% de su venta), por periodo, movimientos.
4. **Rentabilidad por sucursal**: utilidad estimada por tienda, egresos % de la venta contra el límite, sueldos/renta/gasto operativo % de la venta.
5. **Efectivo (VENTAS AL DIA)**: recibido, salidas por categoría, depósitos Banamex vs otras cuentas, cuadre recibido vs "Efectivo a Entregar" por tienda.
6. **Compras Sayer**: facturas, monto, descuento, notas de crédito, neto, pagos, días de factura a pago.
7. **Proveedores**: top por monto y por número de órdenes, por tipo y forma de pago, resumen por proveedor.

## Definiciones (las mismas en el tablero y en `resumen.py`)

- **Venta** = Σ VENTA X VENDEDOR del Resumen. Se cobra en efectivo (efectivo a entregar + egresos), débito, crédito, transferencia, otros/cheques; el resto es "crédito / a cuenta / ajustes" (puede ser negativo por cobranza).
- **Utilidad estimada** = Venta − compras de mercancía (Sayer: monto − descuento K, notas de crédito en negativo; otros proveedores de tipo Mercancía pagados por transferencia o tarjeta) − egresos operativos de tienda − gastos centrales de VENTAS AL DIA (Sueldos, Impuestos, Renta, Gasto operativo) − proveedores de tipo Servicios pagados por transferencia o tarjeta.
  - No restan: Facturación/IVA, Retiros/pagos personales de socios, Cancelaciones.
  - Proveedores pagados en EFECTIVO no se suman: ya están en egresos de tienda o en salidas de VENTAS AL DIA (validado en septiembre: estopas, molduras, borlas, IMSS, SAT, etc.).
  - Proveedores de tipo "Pago de tarjeta" (p. ej. TARJETA ORO BANAMEX) no restan: la tarjeta paga cargos que ya están registrados (CFE, Telmex).
  - No es utilidad contable: las compras del periodo no son el costo de lo vendido. En periodos cortos o meses sin cerrar se distorsiona mucho (p. ej. 1-16 oct 2026 dio 44%, contra 15.5% de septiembre completo, porque faltaban compras y salidas por capturar). Úsala sobre meses cerrados y dilo en la respuesta si el periodo es parcial.
- **Por sucursal**: compras, gastos centrales y servicios no traen sucursal; se asignan según el % de la venta de cada tienda. Las diferencias entre tiendas vienen de sus propios egresos.
- **Semáforo del diagnóstico** (constante `UMBRALES` al inicio de app.js y de resumen.py): egresos de tienda > 10% de su venta = amarillo; cancelaciones por error > 3% de la venta = amarillo; efectivo recibido − efectivo a entregar fuera de ±$500 = amarillo. Con 3 o más meses anteriores cargados, el tablero muestra además el promedio histórico. Estos límites los propuso Claude; si Max da otros, cámbialos en ambos archivos (en el tablero: `ArtifactData str_replace` sobre `files/app.js`, campo `text`).
- **Categorías de egresos y salidas** (por palabras clave, en orden): Facturación/IVA · Cancelaciones · Impuestos · Renta · Sueldos · Retiros/pagos personales de socios · Gasto operativo · Otros.

## Cómo ejecutarla

1. **Periodo**: el que diga Max ("carga octubre" → 2026-10-01 a 2026-10-31). Si no lo dice, usa el encabezado Desde/Hasta de los Resúmenes y confírmalo en la respuesta.
2. **Entorno**: `python3 -c "import openpyxl, xlrd" 2>/dev/null || pip install openpyxl xlrd --break-system-packages -q`
3. **Escribe los scripts** de la sección "Scripts" tal cual en el directorio de trabajo: `extraer.py`, `combinar.py`, `resumen.py` (los tres en la misma carpeta; `combinar.py` importa `extraer.py`). Copia los adjuntos al directorio de trabajo (no toques los originales).
4. **Extrae el periodo**:
   ```bash
   python3 extraer.py --ventas SAYER_VENTAS.xlsx --resumen ResumenSantaRosa.xlsx ResumenCuautepec.xlsx ResumenTlalne.xls \
       --desde 2026-10-01 --hasta 2026-10-31 --salida datos.json --tablas nuevo
   ```
   Revisa la consola: venta por tienda, egresos, cancelaciones, salidas, facturas Sayer y proveedores. Si algo sale en 0, revisa que las pestañas y columnas sigan donde se esperan antes de seguir.
5. **Baja las tablas actuales del tablero**: `ArtifactData list` de la colección `datasets` (url del tablero). De cada documento toma `source.url` (`/_blob/<id>`) y su `version`. Baja cada archivo con `Artifact read` (`url` del tablero, `path` = `<id>`, `out_dir` = `previo_raw`) — las 12 lecturas en paralelo — y renómbralo a `previo/<doc_id>.json` (p. ej. `previo/ventas_diarias.json`).
6. **Combina** (reemplaza solo las fechas del periodo, conserva los demás meses y actualiza pagos pendientes de meses anteriores):
   ```bash
   python3 combinar.py --nuevo nuevo --previo previo --desde 2026-10-01 --hasta 2026-10-31 --ventas SAYER_VENTAS.xlsx --salida acumulado
   ```
7. **Sube los 12 archivos** de `acumulado/` como assets del tablero: una llamada `Artifact` por archivo (`url` del tablero, `asset: true`, `file_path`), todas en paralelo. Guarda el `url` (`/_blob/…`) que devuelve cada una.
8. **Apunta el tablero a los archivos nuevos** con un solo `ArtifactData batch`: por cada dataset, `op: "update"`, `collection: "datasets"`, `doc_id`, `if_version` (la del paso 5) y `data: {source: {kind: "file", url: "/_blob/<nuevo>", name: "<doc_id>.json"}, updated: {at: <ISO ahora, hora de Ciudad de México>, by: "Claude"}}`. No toques `files/index.html` ni `files/app.js` salvo que Max pida un cambio al tablero.
9. **Revisa**: `ArtifactData get` colección `data/users/me`, doc `check`. Si dice `checking`, vuelve a leer (máximo 5). Si no existe, léelo una vez más y sigue (el tablero no está abierto). Si dice `failed`, corrige solo lo que el código confirme. Después lee el doc `runs`: si un dataset aparece con `failed`, el archivo no cargó; revisa la url.
10. **Borra los assets anteriores** (los `<id>` del paso 5): `Artifact` `action: "delete"`, `url` del tablero, `path: <id>`. Ya nada los usa.
11. **Diagnóstico**: `python3 resumen.py --tablas acumulado --desde 2026-10-01 --hasta 2026-10-31`. Si hay conceptos en "Otros", agrega palabras clave a `CATEGORIAS` en extraer.py, vuelve a correr desde el paso 4 y menciona los que queden.
12. **Responde en español, breve**: periodo cargado; tabla corta de la cascada (venta → utilidad estimada, con % de la venta); por sucursal (venta, egresos %, utilidad %); los puntos en amarillo con su porqué; conceptos que quedaron en "Otros"; aviso si el periodo es parcial. No repitas el resto: está en el tablero. No pegues la url.

## Si el tablero no existe o Max pide uno nuevo

1. `Artifact` `action: "quickstart"`, `intent: "other"`; crea desde el tipo Dashboard que indique (publish con `type_url`, `title: "Tablero SayerPro"`, `auto_open: "after_first_write"`) y lee las instrucciones que devuelve.
2. Corre los pasos 2-4 y `combinar.py` sin `--previo`. Sube los 12 archivos como en el paso 7.
3. Un `ArtifactData batch` con: `dash/meta` `{title: "Tablero SayerPro"}`; `dash/params` `{desde: null, hasta: null, tienda: "Todas", agrupar: "Semana"}`; los 12 `datasets/<id>` con `{title, description, source: {kind: "file", url, name}, updated, fixed: true}`; `files/index.html` y `files/app.js` como `{text: <contenido>}`. Cópialos del tablero actual (`ArtifactData get`, colección `files`, docs `index.html` y `app.js`, con `out_dir`) y escríbelos con `file_path` apuntando a ese JSON; si el tablero ya no existe, tómalos de la sección "Página" de este archivo.
4. Revisa el doc `check` como en el paso 9 y avisa a Max que el enlace es privado hasta que lo comparta, y que quien lo abra puede ver los datos (incluye nombres de clientes).

## Notas

- Los ids de dataset que usa la página: `ventas_diarias, vendedores, egresos_tienda, cancelaciones, devoluciones, clientes, efectivo_entradas, efectivo_salidas, efectivo_depositos, sayer_facturas, sayer_pagos, proveedores`.
- `clientes.json` crece ~170 KB por mes; el límite por archivo es 8 MB (decenas de años).
- Rehacer un mes ya cargado: corre la skill con el mismo periodo; `combinar.py` reemplaza esas fechas sin duplicar.
- Las compras no traen sucursal (columna G de SAYER FRIDA PAGOS vacía). Si algún día se llena, o si el sistema de punto de venta exporta costo de lo vendido por sucursal, la utilidad por tienda puede dejar de ser asignada.
- Historial: septiembre 2026 (completo) y 1-16 de octubre 2026 cargados el 22-oct-2026.

## Scripts

### extraer.py

````python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extrae los datos para los dashboards de SayerPro Soluciones.

Entradas:  libro SAYER VENTAS (.xlsx) + Resúmenes de Venta de las tiendas (.xlsx/.xls, uno o varios meses)
Salida:    un JSON con tablas limpias (ventas diarias, vendedores, egresos, cancelaciones, clientes,
           efectivo de VENTAS AL DIA, facturas y pagos a Sayer, proveedores) + un resumen de validación.

Uso:
  python3 extraer.py --ventas SAYER_VENTAS.xlsx --resumen R1.xlsx R2.xlsx R3.xls \
      [--desde 01/09/2026 --hasta 30/09/2026] --salida datos.json
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

import openpyxl

# ------------------------------------------------------------------ utilidades
MES_TXT = {"ene": 1, "jan": 1, "feb": 2, "mar": 3, "abr": 4, "apr": 4, "may": 5, "jun": 6, "jul": 7,
           "ago": 8, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dic": 12, "dec": 12}
ALIAS_TIENDA = {"SANTA ROSA": "Santa Rosa", "SANTAROSA": "Santa Rosa", "STA ROSA": "Santa Rosa",
                "CUAUTEPEC": "Cuautepec", "CUATEPEC": "Cuautepec", "CUAUTE": "Cuautepec", "CUAUT": "Cuautepec",
                "TLALNE": "Tlalne", "TLALNEPANTLA": "Tlalne", "TLANE": "Tlalne"}


def sin_acentos(s):
    return "".join(c for c in unicodedata.normalize("NFD", str(s)) if unicodedata.category(c) != "Mn")


def num(v):
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v.strip().replace("$", "").replace(",", ""))
        except ValueError:
            return None
    return None


def money(s):
    return float(s.replace(",", ""))


def fecha(v):
    if v is None:
        return None
    if isinstance(v, dt.datetime):
        return v.date()
    if isinstance(v, dt.date):
        return v
    if not isinstance(v, str):
        return None
    s = v.strip().lower()
    m = re.match(r"^(\d{1,2})[\s/\-\.]+([a-zñ]{3,5})\.?[\s/\-\.]+(\d{2,4})$", s)
    if m:
        d, mt, y = m.groups()
        mm = MES_TXT.get(mt[:4]) or MES_TXT.get(mt[:3])
        if mm:
            y = int(y) + (2000 if len(y) == 2 else 0)
            try:
                return dt.date(y, mm, int(d))
            except ValueError:
                return None
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{2,4})$", s)
    if m:
        d, mm, y = (int(x) for x in m.groups())
        y += 2000 if y < 100 else 0
        try:
            return dt.date(y, mm, d)
        except ValueError:
            return None
    return None


def tienda_de(s):
    if not s:
        return None
    return ALIAS_TIENDA.get(re.sub(r"\s+", " ", sin_acentos(s).upper().strip()))


# ------------------------------------------------------------------ categorías de gasto
# Orden importa: la primera regla que coincide gana. Editable.
CATEGORIAS = [
    ("Facturación/IVA", r"\bIVA\b|\bF-?\s?\d{3,}|FACTURA|P/FACTURAR|ADALBERTO|REFACTUR"),
    ("Cancelaciones", r"CANCELA|CAMBIO/DEVOLUCION|DEVOLUCION|FALTARON|FALTANTE"),
    ("Impuestos", r"IMPUESTO|\bIMSS\b|\bSAT\b|TESORERIA|PREDIAL|INFONAVIT"),
    ("Renta", r"\bRENTA\b|\bRETA\b"),
    ("Sueldos", r"SUELDO|NOMINA|COMI?SION|AGUINALDO|BONO|FINIQUITO|VACACIONES|DIA COMPLETO|MEDIO DIA|\bRAYA\b"),
    ("Retiros/pagos personales de socios", r"TARJETA|PLATINUM|\bBLACK\b|RODOLFO|ESTETICA|PERSONAL|COLEGIATURA"),
    ("Gasto operativo", r"GASOLINA|BASURA|AGUA|GARRAFON|LIMPIEZA|TIANGUIS|ESTOPA|TRAPO|HULE|MANTENIMIENTO|"
                        r"REPARA|ARREGLO|\bLUZ\b|CFE|TELMEX|PAPEL|REFACCION|LLANTA|PROPINA|COMIDA|DESAYUNO|CENA|"
                        r"POLLO|REPARTO|ENTREGAR|FLETE|CAMIONETA|PALA|MANGO|BOLSA|CINTA|PINTURA|HERRAMIENTA|"
                        r"CUMPLEA|FESTEJ|SEGURO|ALARMA|GAS\b|TAXI|UBER|ESTACIONAMIENTO|CASETA|VERIFICACION|"
                        r"TELEFONO|RECARGA|CELULAR|CONTABLE|GPS|YESO|ESTUCO|MOLDURA|BORLA|CHAPA|MASKING|GRAPA|"
                        r"COSTAL|ALGODON|GARRAFA|FLOTA|BULTO|BASTON|LIJA|BROCHA|RODILLO|TORNILLO|CLAVO|"
                        r"CLORO|LIMPIADOR|PINOL|JABON|ETIQUETA|SALDO TEL"),
]
CATEGORIAS = [(n, re.compile(p)) for n, p in CATEGORIAS]


def categoria(texto):
    t = sin_acentos(texto).upper()
    for nombre, rx in CATEGORIAS:
        if rx.search(t):
            return nombre
    return "Otros"


def tipo_proveedor(nombre, forma):
    t = sin_acentos(nombre).upper()
    if re.search(r"IMPUESTO|\bIMSS\b|\bSAT\b|TESORERIA|PREDIAL", t):
        return "Impuestos"
    if re.search(r"^TARJETA|TARJETA (ORO|PLATINUM|BLACK|CRED|AMEX)", t):
        return "Pago de tarjeta"
    if re.search(r"\bCFE\b|TELMEX|TELCEL|IZZI|TOTALPLAY|ENGIE|GAS NATURAL|AGUA|TARJETA|BANAMEX|BBVA|"
                 r"SANTANDER|SEGURO|RENTA", t):
        return "Servicios"
    return "Mercancía"


# ------------------------------------------------------------------ Resúmenes de Venta
PAGO_RE = re.compile(
    r"(?P<cod>\d{2})\s*-\s+(?P<forma>Efectivo|Transferencia|T/Cr[ée]dito|T/D[ée]bito|Cheque|[A-Za-z/]+)"
    r"\s+(?P<acuenta>A CUENTA\s+)?(?:(?P<cta>[0-9A-Z]{3,5})\s+)?\$(?P<monto>[\d,]+\.\d{2})")
NOTA_RE = re.compile(r"(?:Factura (?P<fac>\S+) )?Nota (?P<nota>\d+):")
FORMA_NORM = {"Efectivo": "Efectivo", "Transferencia": "Transferencia"}


def filas_resumen(path):
    if path.lower().endswith(".xls"):
        import xlrd
        sh = xlrd.open_workbook(path).sheet_by_index(0)
        return [[sh.cell_value(i, j) for j in range(min(sh.ncols, 6))] for i in range(sh.nrows)]
    ws = openpyxl.load_workbook(path, data_only=True, read_only=True).worksheets[0]
    return [list(r[:6]) for r in ws.iter_rows(values_only=True)]


def detectar_tienda(path, filas):
    n = sin_acentos(os.path.basename(path)).upper()
    if "SANTA" in n or "ROSA" in n:
        return "Santa Rosa"
    if "CUAUT" in n or "CUATE" in n:
        return "Cuautepec"
    if "TLAL" in n:
        return "Tlalne"
    texto = " ".join(str(c) for f in filas[:400] for c in f if c)
    if "Factura TL-" in texto:
        return "Tlalne"
    if "Factura A-" in texto:
        return "Cuautepec"
    return "Santa Rosa"


def clientes_de(concepto):
    """Separa un renglón de detalle en (cliente, factura, nota, [(forma, monto)])."""
    salida = []
    pagos = list(PAGO_RE.finditer(concepto))
    notas = list(NOTA_RE.finditer(concepto))
    for i, nm in enumerate(notas):
        fin_prev = 0
        for p in pagos:
            if p.end() <= nm.start():
                fin_prev = p.end()
        cliente = concepto[fin_prev:nm.start()].strip(" ,").rstrip(" -")
        cliente = re.split(r"\s+-\s+", cliente)[0].strip(" -") or "Sin nombre"
        lim = notas[i + 1].start() if i + 1 < len(notas) else len(concepto)
        ps = [(p.group("forma"), money(p.group("monto")), bool(p.group("acuenta")))
              for p in pagos if nm.end() <= p.start() < lim]
        salida.append((cliente, nm.group("fac") or "", nm.group("nota"), ps))
    return salida


def norm_forma(f):
    f = sin_acentos(f)
    if f.startswith("T/Cr"):
        return "T/Crédito"
    if f.startswith("T/D"):
        return "T/Débito"
    return FORMA_NORM.get(f, f)


def leer_resumen(path):
    filas = filas_resumen(path)
    tienda = detectar_tienda(path, filas)
    h = next((i for i, f in enumerate(filas[:15]) if "Fecha" in [str(x).strip() for x in f]), 3)
    dias, vendedores, egresos, cancel, devol, clientes = {}, [], [], {}, [], {}
    for f in filas[h + 1:]:
        if len(f) < 5:
            continue
        fe = fecha(f[1])
        if not fe:
            continue
        corte = str(f[2] or "").strip().upper()
        con = str(f[3] or "").strip()
        imp = num(f[4]) or 0.0
        d = dias.setdefault(fe, dict(fecha=fe.isoformat(), tienda=tienda, efectivo_entregar=0.0, debito=0.0,
                                     credito=0.0, transferencias=0.0, otros=0.0, cheques=0.0))
        if corte == "":
            claves = {"Efectivo a Entregar": "efectivo_entregar", "Total Tarjeta de Débito": "debito",
                      "Total Tarjeta de Crédito": "credito", "Total Transferencias": "transferencias",
                      "Total Otros": "otros", "Total Cheques": "cheques"}
            if con in claves:
                d[claves[con]] = imp
                continue
            if "$" in con and "Nota" in con:
                for cli, fac, nota, ps in clientes_de(con):
                    k = (nota, cli)
                    c = clientes.setdefault(k, dict(fecha=fe.isoformat(), tienda=tienda, cliente=cli,
                                                    factura=fac, nota=nota, efectivo=0.0, transferencia=0.0,
                                                    debito=0.0, credito=0.0))
                    for forma, monto, _ in ps:
                        campo = {"Efectivo": "efectivo", "Transferencia": "transferencia",
                                 "T/Débito": "debito", "T/Crédito": "credito"}.get(norm_forma(forma))
                        if campo and c[campo] == 0:
                            c[campo] = monto
        elif corte.startswith("VENTA X VENDEDOR"):
            nombre = con.split("%")[0].strip().title()
            vendedores.append(dict(fecha=fe.isoformat(), tienda=tienda, vendedor=nombre, monto=imp))
        elif corte.startswith("EGRESOS"):
            m = re.match(r"(\d+)\s*-\s*(.*)", con)
            folio, concepto = (m.group(1), m.group(2).strip()) if m else ("", con)
            egresos.append(dict(fecha=fe.isoformat(), tienda=tienda, folio=folio, concepto=concepto,
                                categoria=categoria(concepto), monto=imp))
        elif corte.startswith("CANCELADAS"):
            m = re.search(r"Nota: (\d+) Cancelada:\s*(.*)$", con)
            if m and m.group(1) not in cancel:
                motivo = m.group(2).strip()
                tipo = "Cancelación global (refacturación)" if "GLOBAL" in sin_acentos(motivo).upper() \
                    else "Error / corrección"
                cancel[m.group(1)] = dict(fecha=fe.isoformat(), tienda=tienda, nota=m.group(1), monto=imp,
                                          motivo=motivo[:120], tipo=tipo)
        elif corte.startswith("CAMBIOS/DEVOLUCIONES"):
            devol.append(dict(fecha=fe.isoformat(), tienda=tienda, nota=con.replace("Nota", "").strip(),
                              monto=imp))
    rango = None
    for f in filas[:6]:
        for x in f:
            if isinstance(x, str) and "Desde:" in x:
                m = re.search(r"Desde:\s*(\S+)\s+Hasta:\s*(\S+)", x)
                if m:
                    rango = (fecha(m.group(1)), fecha(m.group(2)))
    return tienda, dict(dias=list(dias.values()), vendedores=vendedores, egresos=egresos,
                        cancelaciones=list(cancel.values()), devoluciones=devol,
                        clientes=list(clientes.values())), rango


# ------------------------------------------------------------------ SAYER VENTAS
def leer_ventas_al_dia(ws, desde, hasta):
    """Entradas (efectivo por tienda-día), salidas (por bloque de depósito) y depósitos."""
    entradas, salidas, depositos = [], [], []
    filas_dep = []
    maxr = ws.max_row
    for r in range(1, maxr + 1):
        txt = " ".join(str(ws.cell(r, k).value or "") for k in range(1, 6)).upper()
        if "DEPOSITO" in txt or re.search(r"\bCTA[\.\s]", txt):
            monto = None
            for k in (2, 4):
                v = ws.cell(r, k).value
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    monto = float(v)
                    break
            if monto is None or monto <= 0:
                continue
            fdep = None
            for rr in range(r, max(r - 4, 0), -1):
                for k in range(1, 8):
                    fd = fecha(ws.cell(rr, k).value)
                    if fd and abs((fd - desde).days) < 800:
                        fdep = fd
                        break
                if fdep:
                    break
            destino = "Banamex (cuenta de la empresa)" if ("BANAMEX" in txt or "39 444 91" in txt) \
                else "Otra cuenta"
            etiqueta = str(ws.cell(r, 1).value or ws.cell(r, 3).value or "").strip()
            filas_dep.append((r, fdep, monto, destino, etiqueta))
    # bloques: cada salida pertenece al primer depósito que aparece debajo
    idx = 0
    for r in range(1, maxr + 1):
        while idx < len(filas_dep) and filas_dep[idx][0] < r:
            idx += 1
        a, b, c = ws.cell(r, 1).value, ws.cell(r, 2).value, ws.cell(r, 3).value
        t = tienda_de(c)
        if t and num(b) is not None and not isinstance(b, str):
            fe = fecha(a)
            if fe and fe.year == desde.year + 1 and fe > hasta + dt.timedelta(days=180):
                fe = dt.date(desde.year, fe.month, fe.day)   # año capturado a futuro
            if fe and desde <= fe <= hasta:
                entradas.append(dict(fecha=fe.isoformat(), tienda=t, monto=float(b), fila=r))
        d, e = ws.cell(r, 4).value, ws.cell(r, 5).value
        if isinstance(d, str) and isinstance(e, (int, float)) and not isinstance(e, bool) and d.strip():
            fdep = filas_dep[idx][1] if idx < len(filas_dep) else None
            if fdep and desde <= fdep <= hasta:
                salidas.append(dict(fecha=fdep.isoformat(), concepto=re.sub(r"\s+", " ", d.strip()),
                                    categoria=categoria(d), monto=float(e), fila=r))
    for r, fdep, monto, destino, etiqueta in filas_dep:
        if fdep and desde <= fdep <= hasta:
            depositos.append(dict(fecha=fdep.isoformat(), monto=monto, destino=destino, concepto=etiqueta, fila=r))
    return entradas, salidas, depositos


def leer_sayer(ws, desde, hasta):
    facturas, pagos, grupo = [], [], []
    for r in range(3, ws.max_row + 1):
        fe = fecha(ws.cell(r, 1).value)
        b = ws.cell(r, 2).value
        if fe and isinstance(b, (int, float)) and not isinstance(b, bool):
            k = num(ws.cell(r, 11).value)
            if k is None:
                k = round(b * 0.015, 6) if b > 0 else 0.0
            item = dict(fecha=fe.isoformat(), factura=str(ws.cell(r, 3).value or ""), monto=float(b),
                        descuento=k, nota_credito=num(ws.cell(r, 9).value) or 0.0,
                        tipo="Nota de crédito" if b < 0 else "Factura",
                        observacion=str(ws.cell(r, 4).value or "")[:150], fila=r)
            grupo.append(item)
        j = ws.cell(r, 10).value
        if isinstance(j, (int, float)) and not isinstance(j, bool) and j:
            fp = fecha(ws.cell(r, 12).value)
            for it in grupo:
                it["fecha_pago"] = fp.isoformat() if fp else None
                it["dias_a_pago"] = (fp - dt.date.fromisoformat(it["fecha"])).days if fp else None
            if fp and desde <= fp <= hasta:
                pagos.append(dict(fecha=fp.isoformat(), monto=float(j), facturas=len(grupo),
                                  descripcion=str(ws.cell(r, 15).value or "").strip()))
            facturas.extend(grupo)
            grupo = []
    facturas.extend(grupo)   # facturas aún sin pagar
    facturas = [f for f in facturas if desde <= dt.date.fromisoformat(f["fecha"]) <= hasta]
    return facturas, pagos


def leer_proveedores(ws, desde, hasta):
    salida = []
    for r in range(2, ws.max_row + 1):
        prov = str(ws.cell(r, 3).value or "").strip()
        importe = num(ws.cell(r, 5).value)
        pagado = num(ws.cell(r, 9).value)
        if not prov or not (importe or pagado):
            continue
        fe = fecha(ws.cell(r, 1).value)
        if not fe or not (desde <= fe <= hasta):
            continue
        fp = fecha(ws.cell(r, 12).value)
        forma = str(ws.cell(r, 10).value or "").strip().upper() or "SIN DATO"
        if "EFECTIVO" in forma:
            forma = "EFECTIVO"
        elif "TRANSFER" in forma:
            forma = "TRANSFERENCIA"
        elif re.search(r"TARJETA|PLATINUM|BLACK", forma):
            forma = "TARJETA"
        importe = importe if importe is not None else pagado
        pagado = pagado if pagado is not None else importe
        salida.append(dict(fecha=fe.isoformat(), proveedor=re.sub(r"\s+", " ", prov),
                           factura=str(ws.cell(r, 4).value or "")[:40], importe=importe, pagado=pagado,
                           descuento=round(max(importe - pagado, 0), 2), forma_pago=forma,
                           fecha_pago=fp.isoformat() if fp and fp.year > 2000 else None,
                           tipo=tipo_proveedor(prov, forma), fila=r))
    return salida


# ------------------------------------------------------------------ principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ventas", required=True)
    ap.add_argument("--resumen", nargs="+", required=True)
    ap.add_argument("--desde")
    ap.add_argument("--hasta")
    ap.add_argument("--salida", required=True)
    ap.add_argument("--tablas", help="carpeta donde escribir un JSON por tabla (para el tablero)")
    a = ap.parse_args()

    res = defaultdict(list)
    rangos = []
    for p in a.resumen:
        tienda, datos, rango = leer_resumen(p)
        for k, v in datos.items():
            res[k].extend(v)
        if rango and all(rango):
            rangos.append(rango)
        print(f"  {os.path.basename(p)} -> {tienda}: {len(datos['dias'])} días")
    def fecha_arg(t):
        f = fecha(t)
        return f if f else dt.date.fromisoformat(t)
    desde = fecha_arg(a.desde) if a.desde else min(r[0] for r in rangos)
    hasta = fecha_arg(a.hasta) if a.hasta else max(r[1] for r in rangos)
    en = lambda x: desde <= dt.date.fromisoformat(x["fecha"]) <= hasta  # noqa: E731
    for k in list(res):
        res[k] = [x for x in res[k] if en(x)]
    # días sin venta (domingos o cerrados) fuera
    vend_dia = defaultdict(float)
    for v in res["vendedores"]:
        vend_dia[(v["fecha"], v["tienda"])] += v["monto"]
    egr_dia = defaultdict(float)
    for e in res["egresos"]:
        egr_dia[(e["fecha"], e["tienda"])] += e["monto"]
    dias = []
    for d in res["dias"]:
        k = (d["fecha"], d["tienda"])
        d["venta"] = round(vend_dia.get(k, 0.0), 2)
        d["egresos"] = round(egr_dia.get(k, 0.0), 2)
        d["efectivo"] = round(d["efectivo_entregar"] + d["egresos"], 2)   # efectivo cobrado antes de egresos
        cobrado = d["efectivo"] + d["debito"] + d["credito"] + d["transferencias"] + d["otros"] + d["cheques"]
        d["credito_a_cuenta_ajustes"] = round(d["venta"] - cobrado, 2)
        if d["venta"] or cobrado:
            dias.append(d)
    res["dias"] = sorted(dias, key=lambda x: (x["fecha"], x["tienda"]))

    print("  Leyendo SAYER VENTAS...")
    wb = openpyxl.load_workbook(a.ventas, data_only=True)
    entradas, salidas, depositos = leer_ventas_al_dia(wb["VENTAS AL DIA"], desde, hasta)
    facturas, pagos = leer_sayer(wb["SAYER FRIDA PAGOS"], desde, hasta)
    prov = leer_proveedores(wb["PROVEDORES"], desde, hasta)

    datos = dict(
        generado=dt.datetime.now().isoformat(timespec="minutes"),
        periodo=dict(desde=desde.isoformat(), hasta=hasta.isoformat()),
        ventas_diarias=res["dias"], vendedores=res["vendedores"], egresos_tienda=res["egresos"],
        cancelaciones=res["cancelaciones"], devoluciones=res["devoluciones"], clientes=res["clientes"],
        efectivo_entradas=entradas, efectivo_salidas=salidas, efectivo_depositos=depositos,
        sayer_facturas=facturas, sayer_pagos=pagos, proveedores=prov,
        categorias=[n for n, _ in CATEGORIAS] + ["Otros"],
    )
    def redondear(x):
        if isinstance(x, float):
            return round(x, 2)
        if isinstance(x, list):
            return [redondear(i) for i in x]
        if isinstance(x, dict):
            return {k: redondear(v) for k, v in x.items() if k != "fila"}
        return x
    datos = redondear(datos)
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=0)
    if a.tablas:
        os.makedirs(a.tablas, exist_ok=True)
        for k, v in datos.items():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                with open(os.path.join(a.tablas, k + ".json"), "w", encoding="utf-8") as fh:
                    json.dump(v, fh, ensure_ascii=False, separators=(",", ":"))

    # ---- resumen de validación en consola
    V = sum(d["venta"] for d in res["dias"])
    print(f"\nPeriodo {desde} a {hasta}")
    print(f"  Venta total: {V:,.2f}  | días-tienda: {len(res['dias'])}")
    for t in ("Santa Rosa", "Cuautepec", "Tlalne"):
        print(f"    {t}: {sum(d['venta'] for d in res['dias'] if d['tienda'] == t):,.2f}")
    print(f"  Egresos tienda: {sum(e['monto'] for e in res['egresos']):,.2f} ({len(res['egresos'])})")
    print(f"  Cancelaciones: {len(res['cancelaciones'])} por {sum(c['monto'] for c in res['cancelaciones']):,.2f}")
    print(f"  Clientes (pagos no efectivo): {len(res['clientes'])}")
    print(f"  VENTAS AL DIA: entradas {len(entradas)} ({sum(x['monto'] for x in entradas):,.2f}), "
          f"salidas {len(salidas)} ({sum(x['monto'] for x in salidas):,.2f}), depósitos {len(depositos)}")
    print(f"  Sayer: {len(facturas)} facturas ({sum(f['monto'] for f in facturas):,.2f}), {len(pagos)} pagos")
    print(f"  Proveedores: {len(prov)} ({sum(p['pagado'] for p in prov):,.2f})")
    print(f"  Guardado: {a.salida}")


if __name__ == "__main__":
    main()
````

### combinar.py

````python
#!/usr/bin/env python3
"""Combina las tablas nuevas (extraer.py --tablas) con las que ya tiene el tablero.

- Reemplaza, tabla por tabla, los renglones cuya fecha cae en el periodo nuevo (--desde/--hasta)
  y conserva todo lo demás: así el tablero acumula meses y se puede rehacer un mes sin duplicar.
- Con --ventas, vuelve a leer SAYER FRIDA PAGOS y PROVEDORES desde la factura pendiente más antigua
  para actualizar facturas de meses anteriores que ya se pagaron.
"""
import argparse
import datetime as dt
import json
import os
import sys

TABLAS = ["ventas_diarias", "vendedores", "egresos_tienda", "cancelaciones", "devoluciones", "clientes",
          "efectivo_entradas", "efectivo_salidas", "efectivo_depositos", "sayer_facturas", "sayer_pagos",
          "proveedores"]


def cargar(carpeta, t):
    p = os.path.join(carpeta, t + ".json") if carpeta else None
    if p and os.path.exists(p):
        with open(p, encoding="utf-8") as fh:
            d = json.load(fh)
        return d if isinstance(d, list) else d.get("rows") or d.get("data") or []
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nuevo", required=True, help="carpeta con las tablas del periodo nuevo")
    ap.add_argument("--previo", help="carpeta con las tablas actuales del tablero (vacía la primera vez)")
    ap.add_argument("--desde", required=True)
    ap.add_argument("--hasta", required=True)
    ap.add_argument("--ventas", help="libro SAYER VENTAS, para actualizar pagos pendientes de meses anteriores")
    ap.add_argument("--salida", required=True)
    a = ap.parse_args()
    desde, hasta = a.desde, a.hasta
    os.makedirs(a.salida, exist_ok=True)
    out = {}
    for t in TABLAS:
        prev = [r for r in cargar(a.previo, t) if not (desde <= r["fecha"] <= hasta)]
        nuevo = cargar(a.nuevo, t)
        out[t] = sorted(prev + nuevo, key=lambda r: (r["fecha"], r.get("tienda", "")))
        print(f"  {t}: {len(prev)} anteriores + {len(nuevo)} nuevos = {len(out[t])}")

    if a.ventas:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import openpyxl
        import extraer
        pend_s = [r for r in out["sayer_facturas"] if not r.get("fecha_pago") and r["fecha"] < desde]
        pend_p = [r for r in out["proveedores"] if not r.get("pagado") and r["fecha"] < desde]
        if pend_s or pend_p:
            wb = openpyxl.load_workbook(a.ventas, data_only=True)
            ini = dt.date.fromisoformat(min(r["fecha"] for r in pend_s + pend_p))
            fin = dt.date.fromisoformat(hasta)
            n = 0
            if pend_s:
                fac, _ = extraer.leer_sayer(wb["SAYER FRIDA PAGOS"], ini, fin)
                por = {(f["factura"], f["fecha"]): f for f in fac}
                for r in pend_s:
                    f = por.get((r["factura"], r["fecha"]))
                    if f and f.get("fecha_pago"):
                        r["fecha_pago"], r["dias_a_pago"] = f["fecha_pago"], f.get("dias_a_pago")
                        n += 1
            if pend_p:
                prov = extraer.leer_proveedores(wb["PROVEDORES"], ini, fin)
                por = {(p["proveedor"], p["factura"], p["fecha"]): p for p in prov}
                for r in pend_p:
                    p = por.get((r["proveedor"], r["factura"], r["fecha"]))
                    if p and p.get("pagado"):
                        for k in ("pagado", "fecha_pago", "forma_pago", "descuento"):
                            r[k] = round(p[k], 2) if isinstance(p.get(k), float) else p.get(k)
                        n += 1
            print(f"  Pagos de meses anteriores actualizados: {n} de {len(pend_s) + len(pend_p)} pendientes")

    for t, rows in out.items():
        for r in rows:
            r.pop("fila", None)
        with open(os.path.join(a.salida, t + ".json"), "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, separators=(",", ":"))
    meses = sorted({r["fecha"][:7] for r in out["ventas_diarias"]})
    print(f"  Meses en el tablero: {', '.join(meses)}")
    grande = [(t, os.path.getsize(os.path.join(a.salida, t + '.json'))) for t in TABLAS]
    print("  Tamaños: " + ", ".join(f"{t} {s // 1024} KB" for t, s in grande))


if __name__ == "__main__":
    main()
````

### resumen.py

````python
#!/usr/bin/env python3
"""Imprime el diagnóstico del periodo con las mismas fórmulas del tablero (para la respuesta a Max)."""
import argparse
import json
import os

NO_GASTO = {"Facturación/IVA", "Retiros/pagos personales de socios", "Cancelaciones"}
CENTRALES = {"Sueldos", "Impuestos", "Renta", "Gasto operativo"}
TIENDAS = ["Santa Rosa", "Cuautepec", "Tlalne"]
UMBRALES = {"egresosTienda": 0.10, "cancelErr": 0.03, "difEfectivo": 500}  # mismos que app.js


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tablas", required=True)
    ap.add_argument("--desde", required=True)
    ap.add_argument("--hasta", required=True)
    a = ap.parse_args()
    T = {}
    for f in os.listdir(a.tablas):
        if f.endswith(".json"):
            rows = json.load(open(os.path.join(a.tablas, f), encoding="utf-8"))
            T[f[:-5]] = [r for r in rows if a.desde <= r["fecha"] <= a.hasta]
    s = lambda rows, f: sum((f(r) if callable(f) else r[f]) or 0 for r in rows)  # noqa: E731
    v = s(T["ventas_diarias"], "venta")
    if not v:
        print("Sin ventas en el periodo")
        return
    eop = s([r for r in T["egresos_tienda"] if r["categoria"] not in NO_GASTO], "monto")
    say = s(T["sayer_facturas"], lambda r: r["monto"] - r["descuento"])
    pm = s([r for r in T["proveedores"] if r["tipo"] == "Mercancía" and r["forma_pago"] != "EFECTIVO"], lambda r: r["importe"] - r["descuento"])
    sv = s([r for r in T["proveedores"] if r["tipo"] == "Servicios" and r["forma_pago"] != "EFECTIVO"], lambda r: r["importe"] - r["descuento"])
    ce = s([r for r in T["efectivo_salidas"] if r["categoria"] in CENTRALES], "monto")
    u = v - say - pm - eop - ce - sv
    print(f"Periodo {a.desde} a {a.hasta}")
    for n, x in [("Venta", v), ("Compras Sayer (neto)", say), ("Otros proveedores mercancía", pm), ("Egresos operativos tienda", eop),
                 ("Gastos centrales", ce), ("Servicios", sv), ("UTILIDAD ESTIMADA", u)]:
        print(f"  {n:30s} {x:>14,.2f}  {x / v:6.1%}")
    asign = (say + pm + ce + sv) / v
    print("Por sucursal (venta, % total, egresos % venta, utilidad estimada %):")
    for t in TIENDAS:
        vt = s([r for r in T["ventas_diarias"] if r["tienda"] == t], "venta")
        et = s([r for r in T["egresos_tienda"] if r["tienda"] == t and r["categoria"] not in NO_GASTO], "monto")
        if vt:
            flag = "AMARILLO" if et / vt > UMBRALES["egresosTienda"] else "verde"
            print(f"  {t:11s} {vt:>14,.2f} {vt / v:6.1%}  egresos {et / vt:5.1%} ({flag})  utilidad {(vt - et) / vt - asign:5.1%}")
    canc = T["cancelaciones"]
    err = s([c for c in canc if "global" not in c["tipo"].lower()], "monto")
    print(f"Cancelaciones: {len(canc)} notas, {s(canc, 'monto'):,.2f}; por error {err:,.2f} = {err / v:.1%} "
          f"({'AMARILLO' if err / v > UMBRALES['cancelErr'] else 'verde'})")
    dif = s(T["efectivo_entradas"], "monto") - s(T["ventas_diarias"], "efectivo_entregar")
    print(f"Efectivo recibido - a entregar: {dif:,.2f} ({'AMARILLO' if abs(dif) > UMBRALES['difEfectivo'] else 'verde'})")
    fs = T["sayer_facturas"]
    pag = [f for f in fs if f.get("dias_a_pago") is not None]
    if fs:
        print(f"Sayer: {len(fs)} facturas, descuento {s(fs, 'descuento') / s(fs, 'monto'):.1%}, "
              f"{sum(f['dias_a_pago'] for f in pag) / max(1, len(pag)):.1f} días a pago, {len(fs) - len(pag)} sin pago")
    otros = [r["concepto"] for r in T["egresos_tienda"] + T["efectivo_salidas"] if r["categoria"] == "Otros"]
    print(f"Conceptos sin categoría ('Otros'): {len(otros)} {otros[:15]}")


if __name__ == "__main__":
    main()
````

## Página (solo para crear un tablero nuevo)

### files/index.html

````html
<style>
#dash-root .sp { font-family: var(--font-anthropic-sans); color: var(--color-fg); }
.sp-head h1 { font-family: var(--font-anthropic-serif); font-weight: 400; font-size: var(--cds-font-size-title); margin: 0 0 var(--cds-gap-xs); }
.sp-takeaway { color: var(--color-fg-muted); font-size: var(--cds-font-size-body); margin: 0 0 var(--cds-gap-md); max-width: 60rem; }
.sp-controls { display: flex; flex-wrap: wrap; gap: var(--cds-gap-sm) var(--cds-gap-md); align-items: flex-end; margin-bottom: var(--cds-gap-md); }
.sp-controls label { display: flex; flex-direction: column; gap: 2px; font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); }
.sp-controls input, .sp-controls select, .sp-btn { font: inherit; font-size: var(--cds-font-size-body); color: var(--color-fg); background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); padding: var(--cds-pad-xs) var(--cds-pad-sm); }
.sp-btn { cursor: pointer; }
.sp-tabs { display: flex; flex-wrap: wrap; gap: var(--cds-gap-xs); border-bottom: 1px solid var(--color-border-line); margin-bottom: var(--cds-gap-md); }
.sp-tab { font: inherit; font-size: var(--cds-font-size-body); background: none; border: none; border-bottom: 2px solid transparent; color: var(--color-fg-muted); padding: var(--cds-pad-xs) var(--cds-pad-sm); cursor: pointer; }
.sp-tab[aria-selected="true"] { color: var(--color-fg); border-bottom-color: var(--color-fg); }
.sp-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: var(--cds-gap-md); margin-bottom: var(--cds-gap-md); }
.sp-kpi { background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); padding: var(--cds-pad-md); min-height: 6.5rem; }
.sp-kpi .l { font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); }
.sp-kpi .v { font-family: var(--font-anthropic-serif); font-weight: 400; font-size: var(--cds-font-size-title); font-variant-numeric: tabular-nums; margin: 2px 0; }
.sp-kpi .s { font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); font-variant-numeric: tabular-nums; }
.sp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr)); gap: var(--cds-gap-md); margin-bottom: var(--cds-gap-md); }
.sp-card { background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); padding: var(--cds-pad-lg); position: relative; min-width: 0; }
.sp-card.wide { grid-column: 1 / -1; }
.sp-card h2 { font-size: var(--cds-font-size-heading); font-weight: var(--cds-font-weight-medium); margin: 0; }
.sp-card .note { font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); margin: 2px 0 var(--cds-gap-sm); }
.sp-chart { min-height: 240px; position: relative; }
.sp-hbars { display: grid; gap: 6px; }
.sp-hbar { display: grid; grid-template-columns: minmax(6rem, 38%) 1fr auto; gap: var(--cds-gap-sm); align-items: center; font-size: var(--cds-font-size-caption); }
.sp-hbar .lab { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-hbar .track { height: 14px; background: var(--cds-chart-grid); border-radius: 4px; overflow: hidden; }
.sp-hbar .fill { height: 100%; border-radius: 4px; }
.sp-hbar .val { font-variant-numeric: tabular-nums; text-align: right; min-width: 5.5rem; }
.sp-tablebox { max-height: 26rem; overflow: auto; }
.sp-table { width: 100%; border-collapse: collapse; font-size: var(--cds-font-size-caption); font-variant-numeric: tabular-nums; }
.sp-table th { position: sticky; top: 0; background: var(--color-panel); text-align: left; border-bottom: 1px solid var(--color-border-line); padding: 4px 6px; z-index: 1; }
.sp-table th button { font: inherit; font-weight: var(--cds-font-weight-medium); background: none; border: none; color: var(--color-fg); cursor: pointer; padding: 0; }
.sp-table th.num, .sp-table td.num { text-align: right; }
.sp-table td { padding: 4px 6px; border-bottom: 1px solid var(--color-border-line); }
.sp-table tr.tot td { font-weight: var(--cds-font-weight-medium); }
.sp-search { font: inherit; font-size: var(--cds-font-size-caption); color: var(--color-fg); background: var(--color-bg); border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); padding: 4px 8px; margin-bottom: var(--cds-gap-sm); width: min(100%, 18rem); }
.sp-tip { position: absolute; pointer-events: none; background: var(--cds-surface-popover); border: 1px solid var(--cds-border); border-radius: var(--cds-radius); box-shadow: var(--cds-shadow-popover); padding: var(--cds-pad-xs) var(--cds-pad-sm); font-size: var(--cds-font-size-caption); z-index: 5; white-space: nowrap; }
.sp-tip .t { color: var(--cds-text-secondary); margin-bottom: 2px; }
.sp-tip .r { display: flex; gap: 6px; align-items: center; font-variant-numeric: tabular-nums; }
.sp-sw { width: 8px; height: 8px; border-radius: 2px; display: inline-block; flex: none; }
.sp-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); margin-bottom: 6px; }
.sp-legend span { display: inline-flex; align-items: center; gap: 4px; }
.sp-diag { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; font-size: var(--cds-font-size-body); }
.sp-diag li { display: grid; grid-template-columns: 0.6rem 1fr; gap: 8px; align-items: baseline; }
.sp-diag .dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--cds-chart-muted); }
.sp-diag .ok .dot { background: var(--color-ok); } .sp-diag .warn .dot { background: var(--color-warn); } .sp-diag .bad .dot { background: var(--color-bad); }
.sp-formula { font-size: var(--cds-font-size-caption); color: var(--color-fg-muted); margin-top: var(--cds-gap-sm); }
.sp-pos { color: var(--color-ok); } .sp-neg { color: var(--color-bad); }
.sp-seg { display: inline-flex; border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); overflow: hidden; margin-bottom: var(--cds-gap-sm); }
.sp-seg button { font: inherit; font-size: var(--cds-font-size-caption); background: none; border: none; color: var(--color-fg-muted); padding: 3px 10px; cursor: pointer; }
.sp-seg button[aria-pressed="true"] { background: var(--color-bg); color: var(--color-fg); }
.sp-empty { color: var(--color-fg-muted); font-size: var(--cds-font-size-caption); }
[data-dash-source-state=refreshing] { opacity: .5; transition: opacity var(--cds-dur-slow); }
</style>

<div class="sp">
  <header class="sp-head" id="inicio">
    <h1>Tablero SayerPro</h1>
    <p class="sp-takeaway dash-skeleton" id="takeaway" data-source="ventas_diarias sayer_facturas proveedores efectivo_salidas egresos_tienda"></p>
  </header>

  <div class="sp-controls">
    <label>Desde<input class="sp-desde" type="date" min="2020-01-01" max="2099-12-31"></label>
    <label>Hasta<input class="sp-hasta" type="date" min="2020-01-01" max="2099-12-31"></label>
    <label>Sucursal<select class="sp-tienda">
      <option value="Todas">Todas</option><option>Santa Rosa</option><option>Cuautepec</option><option>Tlalne</option>
    </select></label>
    <label>Agrupar por<select class="sp-agrupar">
      <option>Día</option><option>Semana</option><option>Mes</option><option>Bimestre</option><option>Trimestre</option><option>Semestre</option><option>Año</option>
    </select></label>
    <button class="sp-btn sp-reset" type="button">Restablecer</button>
  </div>

  <nav class="sp-tabs" role="tablist">
    <button class="sp-tab" role="tab" data-tab="resumen">Resumen ejecutivo</button>
    <button class="sp-tab" role="tab" data-tab="ventas">Ventas</button>
    <button class="sp-tab" role="tab" data-tab="egresos">Egresos de tienda</button>
    <button class="sp-tab" role="tab" data-tab="rentabilidad">Rentabilidad por sucursal</button>
    <button class="sp-tab" role="tab" data-tab="efectivo">Efectivo</button>
    <button class="sp-tab" role="tab" data-tab="sayer">Compras Sayer</button>
    <button class="sp-tab" role="tab" data-tab="proveedores">Proveedores</button>
  </nav>

  <!-- 1. Resumen ejecutivo -->
  <section class="sp-page" id="resumen" hidden>
    <div class="sp-kpis" id="res-kpis" data-source="ventas_diarias sayer_facturas proveedores efectivo_salidas egresos_tienda cancelaciones"></div>
    <div class="sp-grid">
      <div class="sp-card" id="res-diag-card">
        <h2>Diagnóstico del periodo</h2>
        <p class="note">Cada punto dice su color y por qué. Verde = dentro del límite; amarillo = lo rebasa; sin color = dato informativo. Los límites se ajustan en la skill.</p>
        <ul class="sp-diag" id="res-diag" data-source="ventas_diarias egresos_tienda cancelaciones efectivo_entradas sayer_facturas proveedores efectivo_salidas"></ul>
      </div>
      <div class="sp-card" id="res-cascada-card">
        <h2>De la venta a la utilidad estimada</h2>
        <p class="note" id="res-cascada-note">Toda la empresa, periodo seleccionado.</p>
        <div class="sp-chart" id="res-cascada" data-source="ventas_diarias sayer_facturas proveedores efectivo_salidas egresos_tienda"></div>
        <p class="sp-formula">Utilidad estimada = Venta − compras de mercancía (Sayer neto de descuento + proveedores de mercancía pagados por transferencia o tarjeta) − egresos operativos de tienda − gastos centrales de VENTAS AL DIA (sueldos, impuestos, renta, gasto operativo) − servicios de proveedores. No es utilidad contable: las compras del periodo no son el costo de lo vendido (inventario). Facturación/IVA, retiros de socios y cancelaciones se muestran aparte y no restan.</p>
      </div>
    </div>
    <div class="sp-grid">
      <div class="sp-card wide" id="res-venta-card">
        <h2>Venta por periodo y sucursal</h2>
        <p class="note">Venta total de los Resúmenes de Venta (Σ venta por vendedor).</p>
        <div class="sp-legend" data-source="ventas_diarias" id="res-venta-ley"></div>
        <div class="sp-chart" id="res-venta" data-source="ventas_diarias"></div>
      </div>
    </div>
  </section>

  <!-- 2. Ventas -->
  <section class="sp-page" id="ventas" hidden>
    <div class="sp-kpis" id="ven-kpis" data-source="ventas_diarias cancelaciones devoluciones clientes"></div>
    <div class="sp-grid">
      <div class="sp-card wide" id="ven-periodo-card">
        <h2>Venta por periodo</h2>
        <p class="note">Apilada por sucursal.</p>
        <div class="sp-legend" id="ven-periodo-ley" data-source="ventas_diarias"></div>
        <div class="sp-chart" id="ven-periodo" data-source="ventas_diarias"></div>
      </div>
      <div class="sp-card" id="ven-mix-card">
        <h2>Formas de pago</h2>
        <p class="note">Monto y % de la venta. Operaciones = notas con ese pago (solo pagos con tarjeta o transferencia traen detalle por nota).</p>
        <div class="sp-legend" id="ven-mix-ley" data-source="ventas_diarias"></div>
        <div class="sp-chart" id="ven-mix-chart" data-source="ventas_diarias" style="min-height:150px"></div>
        <div id="ven-mix" data-source="ventas_diarias clientes"></div>
      </div>
      <div class="sp-card" id="ven-vend-card">
        <h2>Venta por vendedor</h2>
        <p class="note">Sección VENTA X VENDEDOR de cada corte.</p>
        <div class="sp-hbars" id="ven-vend" data-source="vendedores"></div>
      </div>
      <div class="sp-card" id="ven-dow-card">
        <h2>Venta promedio por día de la semana</h2>
        <p class="note">Promedio por día con venta, suma de las sucursales seleccionadas.</p>
        <div class="sp-chart" id="ven-dow" data-source="ventas_diarias" style="min-height:200px"></div>
      </div>
      <div class="sp-card" id="ven-canc-card">
        <h2>Cancelaciones y devoluciones</h2>
        <p class="note">"Global" = cancelación para refacturar; "Error" = corrección de nota.</p>
        <div id="ven-canc" data-source="cancelaciones devoluciones ventas_diarias"></div>
      </div>
      <div class="sp-card wide" id="ven-clientes-card">
        <h2>Principales clientes</h2>
        <p class="note">Solo pagos con tarjeta o transferencia: las ventas en efectivo casi nunca traen nombre de cliente.</p>
        <div id="ven-clientes" data-source="clientes"></div>
      </div>
    </div>
  </section>

  <!-- 3. Egresos de tienda -->
  <section class="sp-page" id="egresos" hidden>
    <div class="sp-kpis" id="egr-kpis" data-source="egresos_tienda ventas_diarias"></div>
    <div class="sp-grid">
      <div class="sp-card" id="egr-cat-card">
        <h2>Egresos por categoría</h2>
        <p class="note">Sección EGRESOS de los cortes de caja.</p>
        <div class="sp-hbars" id="egr-cat" data-source="egresos_tienda"></div>
      </div>
      <div class="sp-card" id="egr-mat-card">
        <h2>Sucursal × categoría</h2>
        <p class="note">Monto y % de la venta de cada sucursal.</p>
        <div id="egr-mat" data-source="egresos_tienda ventas_diarias"></div>
      </div>
      <div class="sp-card wide" id="egr-periodo-card">
        <h2>Egresos por periodo</h2>
        <p class="note">Apilados por categoría.</p>
        <div class="sp-legend" id="egr-periodo-ley" data-source="egresos_tienda"></div>
        <div class="sp-chart" id="egr-periodo" data-source="egresos_tienda"></div>
      </div>
      <div class="sp-card wide" id="egr-tabla-card">
        <h2>Movimientos</h2>
        <p class="note">Busca por concepto, sucursal o categoría.</p>
        <div id="egr-tabla" data-source="egresos_tienda"></div>
      </div>
    </div>
  </section>

  <!-- 4. Rentabilidad por sucursal -->
  <section class="sp-page" id="rentabilidad" hidden>
    <div class="sp-grid">
      <div class="sp-card wide" id="ren-tabla-card">
        <h2>Utilidad estimada por sucursal</h2>
        <p class="note">Utilidad estimada = venta − egresos de la tienda − su parte de la mercancía, los gastos centrales y los servicios. Esa parte se reparte según el % de la venta de cada tienda porque las compras no traen sucursal; por eso las diferencias entre tiendas vienen de sus propios egresos.</p>
        <div id="ren-tabla" data-source="ventas_diarias egresos_tienda sayer_facturas proveedores efectivo_salidas"></div>
      </div>
      <div class="sp-card" id="ren-egr-card">
        <h2>Egresos de tienda como % de la venta</h2>
        <p class="note" id="ren-egr-note">Cuánto gasta cada tienda por cada peso que vende.</p>
        <div class="sp-hbars" id="ren-egr" data-source="ventas_diarias egresos_tienda"></div>
      </div>
      <div class="sp-card" id="ren-util-card">
        <h2>Utilidad estimada como % de la venta</h2>
        <p class="note">Cuánto queda de cada peso vendido después de todos los costos asignados.</p>
        <div class="sp-hbars" id="ren-util" data-source="ventas_diarias egresos_tienda sayer_facturas proveedores efectivo_salidas"></div>
      </div>
      <div class="sp-card wide" id="ren-costos-card">
        <h2>Sueldos, renta y gasto operativo</h2>
        <p class="note">Como % de la venta de cada sucursal.</p>
        <div class="sp-legend" id="ren-costos-ley" data-source="egresos_tienda"></div>
        <div class="sp-chart" id="ren-costos" data-source="ventas_diarias egresos_tienda"></div>
      </div>
    </div>
  </section>

  <!-- 5. Efectivo -->
  <section class="sp-page" id="efectivo" hidden>
    <div class="sp-kpis" id="efe-kpis" data-source="efectivo_entradas efectivo_salidas efectivo_depositos"></div>
    <div class="sp-grid">
      <div class="sp-card wide" id="efe-periodo-card">
        <h2>Entradas, salidas y depósitos por periodo</h2>
        <p class="note">Pestaña VENTAS AL DIA. Las salidas y depósitos son de toda la empresa (no traen sucursal).</p>
        <div class="sp-legend" id="efe-periodo-ley" data-source="efectivo_entradas efectivo_salidas efectivo_depositos"></div>
        <div class="sp-chart" id="efe-periodo" data-source="efectivo_entradas efectivo_salidas efectivo_depositos"></div>
      </div>
      <div class="sp-card" id="efe-cat-card">
        <h2>Salidas por categoría</h2>
        <p class="note">Facturación/IVA y retiros de socios no son gasto de operación.</p>
        <div class="sp-hbars" id="efe-cat" data-source="efectivo_salidas"></div>
      </div>
      <div class="sp-card" id="efe-cuadre-card">
        <h2>Efectivo recibido vs efectivo a entregar</h2>
        <p class="note">Recibido en VENTAS AL DIA contra "Efectivo a Entregar" de los cortes.</p>
        <div id="efe-cuadre" data-source="efectivo_entradas ventas_diarias"></div>
      </div>
      <div class="sp-card wide" id="efe-tabla-card">
        <h2>Salidas y depósitos</h2>
        <p class="note">Cada salida queda fechada con el siguiente depósito a Banamex.</p>
        <div id="efe-tabla" data-source="efectivo_salidas efectivo_depositos"></div>
      </div>
    </div>
  </section>

  <!-- 6. Compras Sayer -->
  <section class="sp-page" id="sayer" hidden>
    <div class="sp-kpis" id="say-kpis" data-source="sayer_facturas sayer_pagos ventas_diarias"></div>
    <div class="sp-grid">
      <div class="sp-card wide" id="say-periodo-card">
        <h2>Compras a Sayer por periodo</h2>
        <p class="note">Por fecha de factura: neto pagado + descuento = monto de factura.</p>
        <div class="sp-legend" id="say-periodo-ley" data-source="sayer_facturas"></div>
        <div class="sp-chart" id="say-periodo" data-source="sayer_facturas"></div>
      </div>
      <div class="sp-card" id="say-dias-card">
        <h2>Días de la factura al pago</h2>
        <p class="note">Número de facturas por rango de días.</p>
        <div class="sp-hbars" id="say-dias" data-source="sayer_facturas"></div>
      </div>
      <div class="sp-card" id="say-pagos-card">
        <h2>Pagos realizados</h2>
        <p class="note">Columna J de SAYER FRIDA PAGOS.</p>
        <div id="say-pagos" data-source="sayer_pagos"></div>
      </div>
      <div class="sp-card wide" id="say-tabla-card">
        <h2>Facturas</h2>
        <p class="note">Busca por número de factura.</p>
        <div id="say-tabla" data-source="sayer_facturas"></div>
      </div>
    </div>
  </section>

  <!-- 7. Proveedores -->
  <section class="sp-page" id="proveedores" hidden>
    <div class="sp-kpis" id="pro-kpis" data-source="proveedores"></div>
    <div class="sp-grid">
      <div class="sp-card" id="pro-top-card">
        <h2>Principales proveedores</h2>
        <div class="sp-seg" id="pro-top-modo">
          <button type="button" data-modo="monto" aria-pressed="true">Por monto</button>
          <button type="button" data-modo="ordenes" aria-pressed="false">Por número de órdenes</button>
        </div>
        <div class="sp-hbars" id="pro-top" data-source="proveedores"></div>
      </div>
      <div class="sp-card" id="pro-tipo-card">
        <h2>Por tipo y forma de pago</h2>
        <p class="note">Pagos en efectivo ya están en egresos de tienda o VENTAS AL DIA; los pagos de tarjeta cubren cargos ya registrados.</p>
        <div class="sp-hbars" id="pro-tipo" data-source="proveedores"></div>
        <div style="height:var(--cds-gap-md)"></div>
        <div class="sp-hbars" id="pro-forma" data-source="proveedores"></div>
      </div>
      <div class="sp-card wide" id="pro-tabla-card">
        <h2>Resumen por proveedor</h2>
        <p class="note">Órdenes, importe, descuento y pagado.</p>
        <div id="pro-tabla" data-source="proveedores"></div>
      </div>
    </div>
  </section>
</div>

<script src="app.js"></script>
````

### files/app.js

````javascript
(() => {
  const DS = ['ventas_diarias', 'vendedores', 'egresos_tienda', 'cancelaciones', 'devoluciones', 'clientes',
    'efectivo_entradas', 'efectivo_salidas', 'efectivo_depositos', 'sayer_facturas', 'sayer_pagos', 'proveedores'];
  const TIENDAS = ['Santa Rosa', 'Cuautepec', 'Tlalne'];
  const CATS = ['Sueldos', 'Gasto operativo', 'Renta', 'Impuestos', 'Facturación/IVA',
    'Retiros/pagos personales de socios', 'Cancelaciones', 'Otros'];
  const NO_GASTO = new Set(['Facturación/IVA', 'Retiros/pagos personales de socios', 'Cancelaciones']);
  const CENTRALES = new Set(['Sueldos', 'Impuestos', 'Renta', 'Gasto operativo']);
  // Límites del semáforo del diagnóstico (ajústalos aquí)
  const UMBRALES = { egresosTienda: 0.10, cancelErr: 0.03, difEfectivo: 500 };
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // ---------- formatos
  const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  const mxn2 = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const corto = new Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 2 });
  const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
  const ent = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
  const pct = (x) => (isFinite(x) ? (x * 100).toLocaleString('es-MX', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '%' : '—');
  const $ = (x) => mxn.format(x || 0);
  const $c = (x) => (Math.abs(x) >= 10000 ? '$' + corto.format(x) : mxn.format(x || 0));
  const fd = (s) => { const d = dia(s); return d.getUTCDate() + ' ' + MES[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
  const fdc = (s) => { const d = dia(s); return d.getUTCDate() + ' ' + MES[d.getUTCMonth()]; };

  // ---------- fechas y periodos
  const dia = (s) => new Date(s.slice(0, 10) + 'T00:00:00Z');
  const iso = (d) => d.toISOString().slice(0, 10);
  const sumaDias = (s, n) => { const d = dia(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  function periodo(s, modo) {
    const d = dia(s), y = d.getUTCFullYear(), m = d.getUTCMonth();
    switch (modo) {
      case 'Día': return { k: s, l: fdc(s) };
      case 'Semana': { const lu = sumaDias(s, -((d.getUTCDay() + 6) % 7)); return { k: lu, l: 'Sem ' + fdc(lu) }; }
      case 'Mes': return { k: y + '-' + String(m + 1).padStart(2, '0'), l: MES[m] + ' ' + y };
      case 'Bimestre': { const b = Math.floor(m / 2); return { k: y + '-B' + b, l: MES[b * 2] + '–' + MES[b * 2 + 1] + ' ' + y }; }
      case 'Trimestre': { const t = Math.floor(m / 3) + 1; return { k: y + '-T' + t, l: 'T' + t + ' ' + y }; }
      case 'Semestre': { const t = m < 6 ? 1 : 2; return { k: y + '-S' + t, l: 'S' + t + ' ' + y }; }
      default: return { k: String(y), l: String(y) };
    }
  }

  // ---------- utilidades
  const sum = (rows, f) => rows.reduce((a, r) => a + ((typeof f === 'function' ? f(r) : r[f]) || 0), 0);
  const sumBy = (rows, key, f) => { const m = new Map(); rows.forEach((r) => m.set(key(r), (m.get(key(r)) || 0) + (typeof f === 'function' ? f(r) : r[f]))); return m; };
  const color = (i) => dash.colors[i % dash.colors.length];
  const colorTienda = (t) => color(TIENDAS.indexOf(t));
  const colorCat = (c) => color(CATS.indexOf(c));
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'class') el.className = v; else if (k === 'style') el.style.cssText = v; else el.setAttribute(k, v);
    }
    kids.flat().forEach((c) => { if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  const byId = (id) => document.getElementById(id);
  const limpiar = (id) => { const el = byId(id); el.replaceChildren(); el.classList.remove('dash-skeleton'); return el; };

  // ---------- controles
  const P = () => dash.params();
  const elDesde = document.querySelector('.sp-desde'), elHasta = document.querySelector('.sp-hasta');
  const elTienda = document.querySelector('.sp-tienda'), elAgr = document.querySelector('.sp-agrupar');
  [elDesde, elHasta].forEach((el) => {
    el.addEventListener('change', () => { if (el.value && el.validity.valid) dash.setParams({ [el === elDesde ? 'desde' : 'hasta']: el.value }); });
    el.addEventListener('blur', mostrarControles);
  });
  elTienda.addEventListener('change', () => dash.setParams({ tienda: elTienda.value }));
  elAgr.addEventListener('change', () => dash.setParams({ agrupar: elAgr.value }));
  document.querySelector('.sp-reset').addEventListener('click', () => dash.resetParams());
  let rango = null; // fechas disponibles
  function mostrarControles() {
    const p = P();
    if (document.activeElement !== elDesde) elDesde.value = p.desde || (rango ? rango[0] : '');
    if (document.activeElement !== elHasta) elHasta.value = p.hasta || (rango ? rango[1] : '');
    elTienda.value = p.tienda || 'Todas';
    elAgr.value = p.agrupar || 'Semana';
  }

  // ---------- pestañas
  const tabs = [...document.querySelectorAll('.sp-tab')];
  let actual = 'resumen';
  function mostrar(id, link) {
    if (!byId(id)) id = 'resumen';
    actual = id;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
    document.querySelectorAll('.sp-page').forEach((s) => { s.hidden = s.id !== id; });
    if (link) dash.setLink(id);
    dibujar();
  }
  tabs.forEach((t) => t.addEventListener('click', () => mostrar(t.dataset.tab, true)));
  let modoTop = 'monto';
  byId('pro-top-modo').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-modo]'); if (!b) return;
    modoTop = b.dataset.modo;
    byId('pro-top-modo').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    dibujar();
  });

  // ---------- gráficas
  function tooltip(box) {
    let tip = box.querySelector(':scope > .sp-tip');
    if (!tip) { tip = h('div', { class: 'sp-tip', hidden: '' }); box.append(tip); }
    return {
      show(ev, titulo, filas) {
        tip.replaceChildren(h('div', { class: 't' }, titulo), ...filas.map((f) => h('div', { class: 'r' },
          f.color ? h('span', { class: 'sp-sw', style: 'background:' + f.color }) : null, f.nombre ? f.nombre + ': ' : '', h('b', null, f.valor))));
        tip.hidden = false;
        const r = box.getBoundingClientRect();
        let x = ev.clientX - r.left + 12, y = ev.clientY - r.top + 12;
        if (x + tip.offsetWidth > box.clientWidth) x = Math.max(0, ev.clientX - r.left - tip.offsetWidth - 12);
        if (y + tip.offsetHeight > box.clientHeight) y = Math.max(0, ev.clientY - r.top - tip.offsetHeight - 12);
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
      },
      hide() { tip.hidden = true; },
    };
  }
  function leyenda(id, series) {
    const el = limpiar(id);
    series.forEach((s) => el.append(h('span', null, h('span', { class: 'sp-sw', style: 'background:' + s.color }), s.nombre)));
  }
  function medir(svg, textos) {
    const t = svg.append('text').style('font-size', 'var(--cds-font-size-caption)');
    let w = 0; textos.forEach((s) => { t.text(s); w = Math.max(w, t.node().getComputedTextLength()); });
    t.remove(); return w;
  }
  // barras verticales apiladas (o agrupadas)
  function barras(id, cats, series, valor, opts = {}) {
    const box = limpiar(id);
    const W = Math.max(280, box.clientWidth), H = opts.alto || 240;
    if (!cats.length) { box.append(h('p', { class: 'sp-empty' }, 'Sin movimientos en el periodo seleccionado.')); return; }
    const svg = d3.select(box).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`);
    const agrupado = opts.agrupado;
    const tot = cats.map((c) => agrupado ? d3.max(series, (s) => valor(c, s)) : d3.sum(series, (s) => Math.max(0, valor(c, s))));
    const max = d3.max(tot) || 1;
    const y = d3.scaleLinear([0, max], [H - 26, 10]).nice();
    const fmtY = (v) => (opts.fmt || $c)(v);
    const ml = medir(svg, y.ticks(4).map(fmtY)) + 10;
    const x = d3.scaleBand(cats.map((c) => c.k), [ml, W - 6]).paddingInner(0.25).paddingOuter(0.1);
    svg.append('g').selectAll('line').data(y.ticks(4)).join('line').attr('x1', ml).attr('x2', W - 6)
      .attr('y1', (d) => y(d)).attr('y2', (d) => y(d)).style('stroke', 'var(--cds-chart-grid)');
    svg.append('g').selectAll('text').data(y.ticks(4)).join('text').attr('x', ml - 6).attr('y', (d) => y(d)).attr('dy', '0.32em')
      .attr('text-anchor', 'end').style('font-size', 'var(--cds-font-size-caption)').style('fill', 'var(--color-fg-muted)').text(fmtY);
    // etiquetas x sin encimarse
    const lw = medir(svg, cats.map((c) => c.l)) + 8;
    const paso = Math.max(1, Math.ceil(lw / x.step()));
    svg.append('g').selectAll('text').data(cats.filter((c, i) => i % paso === 0)).join('text')
      .attr('x', (c) => x(c.k) + x.bandwidth() / 2).attr('y', H - 8).attr('text-anchor', 'middle')
      .style('font-size', 'var(--cds-font-size-caption)').style('fill', 'var(--color-fg-muted)').text((c) => c.l);
    const bw = Math.min(agrupado ? x.bandwidth() / series.length : x.bandwidth(), agrupado ? 24 : 40);
    const tip = tooltip(box);
    const g = svg.append('g');
    cats.forEach((c) => {
      let acc = 0;
      const cx = x(c.k) + x.bandwidth() / 2;
      const grupo = g.append('g').attr('class', 'sp-col');
      series.forEach((s, i) => {
        const v = Math.max(0, valor(c, s)); if (!v) return;
        let x0, y0, y1;
        if (agrupado) { x0 = cx - (bw * series.length) / 2 + i * bw; y0 = y(0); y1 = y(v); } else { x0 = cx - bw / 2; y0 = y(acc); y1 = y(acc + v); acc += v; }
        grupo.append('rect').attr('x', x0 + (agrupado ? 1 : 0)).attr('width', Math.max(1, bw - (agrupado ? 2 : 0))).attr('y', y1).attr('height', Math.max(0, y0 - y1))
          .attr('rx', agrupado ? 3 : 0).style('fill', s.color);
      });
      grupo.append('rect').attr('x', x(c.k)).attr('width', x.bandwidth()).attr('y', 0).attr('height', H - 22).style('fill', 'transparent')
        .on('mousemove', (ev) => {
          const filas = series.map((s) => ({ color: series.length > 1 ? s.color : null, nombre: series.length > 1 ? s.nombre : '', valor: (opts.fmtTip || $)(valor(c, s)) }));
          if (!agrupado && series.length > 1) filas.push({ nombre: 'Total', valor: $(d3.sum(series, (s) => valor(c, s))) });
          tip.show(ev, c.l, filas);
          grupo.selectAll('rect').attr('opacity', null); svg.selectAll('.sp-col').attr('opacity', 0.45); grupo.attr('opacity', 1);
        })
        .on('mouseleave', () => { tip.hide(); svg.selectAll('.sp-col').attr('opacity', 1); });
    });
  }
  // barras horizontales en HTML
  function barrasH(id, filas, fmt = $, max) {
    const el = limpiar(id);
    if (!filas.length) { el.append(h('p', { class: 'sp-empty' }, 'Sin movimientos en el periodo seleccionado.')); return; }
    const m = max || d3.max(filas, (f) => Math.abs(f.v)) || 1;
    filas.forEach((f) => el.append(h('div', { class: 'sp-hbar', title: null },
      h('span', { class: 'lab' }, f.l),
      h('span', { class: 'track' }, h('span', { class: 'fill', style: `display:block;width:${Math.max(0, (Math.abs(f.v) / m) * 100)}%;background:${f.c || color(0)}` })),
      h('span', { class: 'val' }, fmt(f.v), f.s ? h('span', { style: 'color:var(--color-fg-muted)' }, ' · ' + f.s) : null))));
  }
  // cascada venta → utilidad
  function cascada(id, pasos) {
    const box = limpiar(id);
    const W = Math.max(280, box.clientWidth), H = 260;
    const svg = d3.select(box).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`);
    let acc = 0; const bars = pasos.map((p) => {
      if (p.total) { const b = { ...p, a: 0, b: p.v }; acc = p.v; return b; }
      const b = { ...p, a: acc, b: acc - p.v }; acc -= p.v; return b;
    });
    const lo = Math.min(0, d3.min(bars, (b) => Math.min(b.a, b.b))), hi = d3.max(bars, (b) => Math.max(b.a, b.b));
    const y = d3.scaleLinear([lo, hi], [H - 40, 18]).nice();
    const x = d3.scaleBand(bars.map((b) => b.l), [4, W - 4]).padding(0.25);
    svg.append('line').attr('x1', 4).attr('x2', W - 4).attr('y1', y(0)).attr('y2', y(0)).style('stroke', 'var(--cds-chart-axis)');
    const tip = tooltip(box);
    bars.forEach((b, i) => {
      const top = y(Math.max(b.a, b.b)), alto = Math.max(1, Math.abs(y(b.a) - y(b.b)));
      const fill = b.total ? (b.v < 0 ? 'var(--cds-chart-status-critical)' : color(0)) : 'var(--cds-chart-muted)';
      svg.append('rect').attr('x', x(b.l)).attr('width', x.bandwidth()).attr('y', top).attr('height', alto).attr('rx', 3).style('fill', fill)
        .on('mousemove', (ev) => tip.show(ev, b.l, [{ valor: (b.total ? '' : '−') + $(b.v) }, ...(b.nota ? [{ valor: b.nota }] : [])]))
        .on('mouseleave', () => tip.hide());
      svg.append('text').attr('x', x(b.l) + x.bandwidth() / 2).attr('y', top - 4).attr('text-anchor', 'middle')
        .style('font-size', 'var(--cds-font-size-caption)').style('fill', 'var(--color-fg)').text((b.total ? '' : '−') + $c(b.v));
    });
    // etiquetas en dos renglones si no caben
    const lw = medir(svg, bars.map((b) => b.l));
    bars.forEach((b, i) => {
      const t = svg.append('text').attr('x', x(b.l) + x.bandwidth() / 2).attr('y', H - 24).attr('text-anchor', 'middle')
        .style('font-size', 'var(--cds-font-size-caption)').style('fill', 'var(--color-fg-muted)');
      if (lw + 4 > x.step()) {
        const ws = b.l.split(' '); const mid = Math.ceil(ws.length / 2);
        t.append('tspan').attr('x', x(b.l) + x.bandwidth() / 2).text(ws.slice(0, mid).join(' '));
        t.append('tspan').attr('x', x(b.l) + x.bandwidth() / 2).attr('dy', '1.2em').text(ws.slice(mid).join(' '));
      } else t.text(b.l);
    });
  }
  // barra 100% horizontal (mezcla)
  function mezcla(id, filas, partes) {
    const box = limpiar(id);
    const W = Math.max(280, box.clientWidth), alto = 22, gap = 10;
    const H = filas.length * (alto + gap) + 4;
    const svg = d3.select(box).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`);
    const ml = medir(svg, filas.map((f) => f.l)) + 10;
    const x = d3.scaleLinear([0, 1], [ml, W - 4]);
    const tip = tooltip(box);
    filas.forEach((f, i) => {
      const yy = i * (alto + gap);
      svg.append('text').attr('x', ml - 8).attr('y', yy + alto / 2).attr('dy', '0.32em').attr('text-anchor', 'end')
        .style('font-size', 'var(--cds-font-size-caption)').style('fill', 'var(--color-fg-muted)').text(f.l);
      const total = d3.sum(partes, (p) => Math.max(0, f.v[p.k])); let acc = 0;
      partes.forEach((p) => {
        const v = Math.max(0, f.v[p.k]); if (!v || !total) return;
        const w = (v / total);
        svg.append('rect').attr('x', x(acc)).attr('width', Math.max(0, x(acc + w) - x(acc) - 1)).attr('y', yy).attr('height', alto).style('fill', p.color)
          .on('mousemove', (ev) => tip.show(ev, f.l + ' · ' + p.nombre, [{ valor: $(v) + ' (' + pct(w) + ')' }]))
          .on('mouseleave', () => tip.hide());
        acc += w;
      });
    });
  }
  // tabla ordenable con búsqueda
  const estadoTablas = {};
  function tabla(id, cols, filas, opts = {}) {
    const el = limpiar(id);
    const st = estadoTablas[id] || (estadoTablas[id] = { q: '', col: opts.orden || null, dir: -1 });
    let input;
    if (opts.buscar) {
      input = h('input', { class: 'sp-search', type: 'search', placeholder: 'Buscar…', 'aria-label': 'Buscar' });
      input.value = st.q; el.append(input);
    }
    const box = h('div', { class: 'sp-tablebox', style: opts.alto ? 'max-height:' + opts.alto : null });
    el.append(box);
    const pinta = () => {
      let rs = filas;
      if (st.q) { const q = st.q.toLowerCase(); rs = rs.filter((r) => cols.some((c) => String(r[c.k] ?? '').toLowerCase().includes(q))); }
      if (st.col) { const c = cols.find((x) => x.k === st.col); rs = [...rs].sort((a, b) => (c && c.num ? (a[st.col] - b[st.col]) : String(a[st.col]).localeCompare(String(b[st.col]))) * st.dir); }
      const thead = h('thead', null, h('tr', null, cols.map((c) => {
        const b = h('button', { type: 'button' }, c.l + (st.col === c.k ? (st.dir < 0 ? ' ↓' : ' ↑') : ''));
        b.addEventListener('click', () => { if (st.col === c.k) st.dir *= -1; else { st.col = c.k; st.dir = c.num ? -1 : 1; } pinta(); });
        return h('th', { class: c.num ? 'num' : null, 'aria-sort': st.col === c.k ? (st.dir < 0 ? 'descending' : 'ascending') : null }, b);
      })));
      const tbody = h('tbody', null, rs.map((r) => h('tr', null, cols.map((c) => h('td', { class: c.num ? 'num' : null }, c.f ? c.f(r[c.k], r) : (r[c.k] ?? ''))))));
      const extra = opts.total ? h('tbody', null, h('tr', { class: 'tot' }, cols.map((c, i) => h('td', { class: c.num ? 'num' : null },
        i === 0 ? 'Total' : (c.sumar ? (c.f ? c.f(d3.sum(rs, (r) => r[c.k]), {}) : d3.sum(rs, (r) => r[c.k])) : ''))))) : null;
      box.replaceChildren(h('table', { class: 'sp-table' }, thead, tbody, extra));
    };
    if (input) input.addEventListener('input', () => { st.q = input.value; pinta(); });
    pinta();
  }
  function kpis(id, items) {
    const el = limpiar(id);
    items.forEach((k) => el.append(h('div', { class: 'sp-kpi', id: id + '-' + k.id },
      h('div', { class: 'l' }, k.l), h('div', { class: 'v' }, k.v), h('div', { class: 's' }, k.s || ''))));
  }
  function delta(act, ant, mejorArriba = true) {
    if (ant == null || !isFinite(ant) || ant === 0) return null;
    const d = (act - ant) / Math.abs(ant);
    const bien = mejorArriba ? d >= 0 : d <= 0;
    return h('span', { class: bien ? 'sp-pos' : 'sp-neg' }, (d >= 0 ? '+' : '−') + pct(Math.abs(d)) + ' vs periodo anterior');
  }

  // ---------- datos filtrados
  function datos() {
    const D = {}; DS.forEach((k) => { D[k] = dash.data(k).data || []; });
    return D;
  }
  function filtro(D, desde, hasta, tienda) {
    const enR = (r) => r.fecha >= desde && r.fecha <= hasta;
    const enT = (r) => tienda === 'Todas' || r.tienda === tienda;
    const F = {};
    ['ventas_diarias', 'vendedores', 'egresos_tienda', 'cancelaciones', 'devoluciones', 'clientes', 'efectivo_entradas']
      .forEach((k) => { F[k] = D[k].filter((r) => enR(r) && enT(r)); });
    ['efectivo_salidas', 'efectivo_depositos', 'sayer_facturas', 'sayer_pagos', 'proveedores'].forEach((k) => { F[k] = D[k].filter(enR); });
    return F;
  }
  // F = filas de la sucursal (o de toda la empresa); Fe = toda la empresa en el mismo rango
  function pyl(F, Fe) {
    const venta = sum(F.ventas_diarias, 'venta');
    const egrOp = sum(F.egresos_tienda.filter((r) => !NO_GASTO.has(r.categoria)), 'monto');
    const ventaEmp = sum(Fe.ventas_diarias, 'venta');
    const parte = ventaEmp ? venta / ventaEmp : 0;
    const sayerNeto = parte * sum(Fe.sayer_facturas, (r) => r.monto - (r.descuento || 0));
    const provMerc = parte * sum(Fe.proveedores.filter((r) => r.tipo === 'Mercancía' && r.forma_pago !== 'EFECTIVO'), (r) => r.importe - (r.descuento || 0));
    const servicios = parte * sum(Fe.proveedores.filter((r) => r.tipo === 'Servicios' && r.forma_pago !== 'EFECTIVO'), (r) => r.importe - (r.descuento || 0));
    const centrales = parte * sum(Fe.efectivo_salidas.filter((r) => CENTRALES.has(r.categoria)), 'monto');
    const compras = sayerNeto + provMerc;
    const util = venta - compras - egrOp - centrales - servicios;
    return { venta, egrOp, sayerNeto, provMerc, compras, servicios, centrales, util, parte };
  }
  // promedio mensual de un indicador en los meses completos anteriores al periodo (null si hay menos de 3)
  function promedioHistorico(fn) {
    const { D, desde, tienda } = ctx;
    const meses = [...new Set(D.ventas_diarias.map((r) => r.fecha.slice(0, 7)))].filter((m) => m < desde.slice(0, 7)).sort();
    if (meses.length < 3) return null;
    const vals = meses.map((m) => {
      const fin = iso(new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 0)));
      return fn(filtro(D, m + '-01', fin, tienda));
    }).filter((v) => isFinite(v));
    return vals.length >= 3 ? { v: d3.mean(vals), n: vals.length } : null;
  }
  function semaforo(valor, limite, txtLimite, hist) {
    const ok = valor <= limite;
    return [ok ? 'ok' : 'warn', (ok ? ' Verde: está debajo del límite de ' : ' Amarillo: rebasa el límite de ') + txtLimite + '.' +
      (hist ? ` Promedio de los ${hist.n} meses anteriores: ${pct(hist.v)}.` : '')];
  }

  // ---------- dibujo
  let ctx = null;
  function dibujar() {
    const st = DS.map((k) => dash.data(k).status);
    if (st.some((s) => s !== 'ok')) return;
    const D = datos();
    const fechas = D.ventas_diarias.map((r) => r.fecha).sort();
    rango = [fechas[0], fechas[fechas.length - 1]];
    mostrarControles();
    const p = P();
    let desde = p.desde || rango[0], hasta = p.hasta || rango[1];
    if (desde > hasta) [desde, hasta] = [hasta, desde];
    const tienda = p.tienda || 'Todas', agr = p.agrupar || 'Semana';
    const F = filtro(D, desde, hasta, tienda);
    const n = Math.round((dia(hasta) - dia(desde)) / 864e5) + 1;
    const antDesde = sumaDias(desde, -n), antHasta = sumaDias(desde, -1);
    const Fa = filtro(D, antDesde, antHasta, tienda);
    const hayAnt = Fa.ventas_diarias.length > 0;
    const empresa = tienda === 'Todas';
    const Fe = empresa ? F : filtro(D, desde, hasta, 'Todas');
    const Fea = empresa ? Fa : filtro(D, antDesde, antHasta, 'Todas');
    ctx = { D, F, Fa, Fe, Fea, hayAnt, desde, hasta, tienda, agr, empresa, n, txtPer: fd(desde) + ' al ' + fd(hasta) + (empresa ? '' : ' · ' + tienda) };
    encabezado();
    ({ resumen, ventas, egresos, rentabilidad, efectivo, sayer, proveedores })[actual]();
  }
  const periodos = (rows, campo = 'fecha') => {
    const m = new Map(); rows.forEach((r) => { const q = periodo(r[campo], ctx.agr); m.set(q.k, q); });
    return [...m.values()].sort((a, b) => (a.k < b.k ? -1 : 1));
  };
  const porPeriodo = (rows, f, campo = 'fecha') => sumBy(rows, (r) => periodo(r[campo], ctx.agr).k, f);

  function encabezado() {
    const { F, Fe, empresa } = ctx;
    const r = pyl(F, Fe);
    const el = byId('takeaway'); el.classList.remove('dash-skeleton');
    const porT = sumBy(F.ventas_diarias, (x) => x.tienda, 'venta');
    const lider = [...porT].sort((a, b) => b[1] - a[1])[0];
    el.textContent = `${ctx.txtPer}: venta de ${$(r.venta)}, utilidad estimada de ${$(r.util)} (${pct(r.util / r.venta)} de la venta)` +
      (empresa && lider ? `; ${lider[0]} aporta ${pct(lider[1] / r.venta)} de la venta.` : '.');
  }

  // 1. Resumen ejecutivo
  function resumen() {
    const { F, Fa, Fe, Fea, hayAnt, empresa } = ctx;
    const r = pyl(F, Fe), a = hayAnt ? pyl(Fa, Fea) : {};
    const canc = sum(F.cancelaciones, 'monto');
    const esErr = (c) => !/global/i.test(c.tipo);
    const cancErr = sum(F.cancelaciones.filter(esErr), 'monto');
    const dep = sum(F.efectivo_depositos, 'monto');
    const sAnt = hayAnt ? null : 'Sin datos del periodo anterior';
    kpis('res-kpis', [
      { id: 'venta', l: 'Venta', v: $c(r.venta), s: delta(r.venta, a.venta) || sAnt },
      { id: 'util', l: 'Utilidad estimada', v: $c(r.util), s: [pct(r.util / r.venta) + ' de la venta', ' · ', delta(r.util, a.util) || ''] },
      { id: 'compras', l: empresa ? 'Compras de mercancía' : 'Mercancía asignada', v: $c(r.compras), s: pct(r.compras / r.venta) + ' de la venta' },
      { id: 'egr', l: 'Egresos operativos de tienda', v: $c(r.egrOp), s: pct(r.egrOp / r.venta) + ' de la venta' },
      { id: 'canc', l: 'Cancelaciones', v: $c(canc), s: F.cancelaciones.length + ' notas · ' + $c(cancErr) + ' por error' },
      { id: 'dep', l: 'Efectivo depositado', v: $c(dep), s: F.efectivo_depositos.length + ' depósitos (toda la empresa)' },
    ]);
    // diagnóstico: cada punto dice su semáforo y por qué
    const L = [];
    if (r.venta) {
      L.push([r.util > 0 ? 'ok' : 'bad', `Utilidad estimada de ${$(r.util)}: ${pct(r.util / r.venta)} de cada peso vendido.` + (r.util > 0 ? ' Verde: es positiva.' : ' Rojo: es negativa.')]);
      if (empresa) {
        const ord = [...sumBy(F.ventas_diarias, (x) => x.tienda, 'venta')].sort((x, y) => y[1] - x[1]);
        L.push(['', 'Participación en la venta: ' + ord.map(([t, v]) => `${t} ${pct(v / r.venta)}`).join(', ') + '.']);
      }
      (empresa ? TIENDAS : [ctx.tienda]).forEach((t) => {
        const ratio = (G) => { const v = sum(G.ventas_diarias.filter((x) => x.tienda === t), 'venta');
          return v ? sum(G.egresos_tienda.filter((x) => x.tienda === t && !NO_GASTO.has(x.categoria)), 'monto') / v : NaN; };
        const v = ratio(F); if (!isFinite(v)) return;
        const [c, txt] = semaforo(v, UMBRALES.egresosTienda, pct(UMBRALES.egresosTienda), promedioHistorico(ratio));
        L.push([c, `${t} gasta ${pct(v)} de su venta en egresos de tienda (sueldos, renta y gasto operativo de sus cortes).` + txt]);
      });
      const ratioC = (G) => sum(G.cancelaciones.filter(esErr), 'monto') / sum(G.ventas_diarias, 'venta');
      const [c, txt] = semaforo(cancErr / r.venta, UMBRALES.cancelErr, pct(UMBRALES.cancelErr), promedioHistorico(ratioC));
      L.push([c, `Cancelaciones por error o corrección: ${$(cancErr)} = ${pct(cancErr / r.venta)} de la venta.` + txt +
        ` No es venta perdida: son notas que se tuvieron que rehacer. Las cancelaciones globales para refacturar (${$(canc - cancErr)}) no cuentan aquí.`]);
    }
    const ent = sumBy(F.efectivo_entradas, (x) => x.tienda, 'monto');
    const esp = sumBy(F.ventas_diarias, (x) => x.tienda, 'efectivo_entregar');
    const dif = d3.sum(TIENDAS, (t) => (ent.get(t) || 0) - (esp.get(t) || 0));
    const okE = Math.abs(dif) <= UMBRALES.difEfectivo;
    L.push([okE ? 'ok' : 'warn', `Efectivo recibido en VENTAS AL DIA menos efectivo a entregar de los cortes: ${$(dif)}.` +
      (okE ? ` Verde: dentro de ±${$(UMBRALES.difEfectivo)}.` : ` Amarillo: fuera de ±${$(UMBRALES.difEfectivo)}; revisa la pestaña Efectivo (los últimos días pueden no estar capturados).`)]);
    if (empresa && r.venta) L.push(['', `Compras de mercancía = ${pct(r.compras / r.venta)} de la venta; Sayer es ${pct(r.sayerNeto / Math.max(1, r.compras))} de las compras.`]);
    const pag = Fe.sayer_facturas.filter((x) => x.dias_a_pago != null);
    if (empresa && Fe.sayer_facturas.length) L.push(['', `Sayer: ${Fe.sayer_facturas.length} facturas, descuento promedio ${pct(sum(Fe.sayer_facturas, 'descuento') / sum(Fe.sayer_facturas, 'monto'))}, pagadas en ${num.format(d3.mean(pag, (x) => x.dias_a_pago) || 0)} días en promedio` + (Fe.sayer_facturas.length - pag.length ? `; ${Fe.sayer_facturas.length - pag.length} sin pago registrado.` : '.')]);
    const ret = sum(Fe.efectivo_salidas.filter((x) => x.categoria === 'Retiros/pagos personales de socios'), 'monto') + sum(F.egresos_tienda.filter((x) => x.categoria === 'Retiros/pagos personales de socios'), 'monto');
    if (empresa && ret) L.push(['', `Retiros y pagos personales de socios: ${$(ret)} (no se restan de la utilidad).`]);
    const ul = limpiar('res-diag');
    L.forEach(([cl, t]) => ul.append(h('li', { class: cl }, h('span', { class: 'dot' }), h('span', null, t))));
    // cascada
    byId('res-cascada-note').textContent = empresa ? 'Toda la empresa, periodo seleccionado.'
      : `${ctx.tienda}: mercancía, gastos centrales y servicios asignados según su ${pct(r.parte)} de la venta (las compras no traen sucursal).`;
    cascada('res-cascada', [
      { l: 'Venta', v: r.venta, total: true },
      { l: 'Compras Sayer', v: r.sayerNeto, nota: 'Neto de descuento' + (empresa ? '' : ', asignado') },
      { l: 'Otros proveedores', v: r.provMerc, nota: 'Mercancía pagada por transferencia o tarjeta' },
      { l: 'Egresos de tienda', v: r.egrOp, nota: 'Sin facturación, retiros ni cancelaciones' },
      { l: 'Gastos centrales', v: r.centrales, nota: 'Sueldos, impuestos, renta y gasto operativo' },
      { l: 'Servicios', v: r.servicios, nota: 'CFE, Telmex, etc.' },
      { l: 'Utilidad estimada', v: r.util, total: true },
    ]);
    const ts = TIENDAS.filter((t) => empresa || t === ctx.tienda).map((t) => ({ nombre: t, color: colorTienda(t), t }));
    leyenda('res-venta-ley', ts);
    const m = sumBy(F.ventas_diarias, (x) => periodo(x.fecha, ctx.agr).k + '|' + x.tienda, 'venta');
    barras('res-venta', periodos(F.ventas_diarias), ts, (c, s) => m.get(c.k + '|' + s.t) || 0);
  }

  // 2. Ventas
  function ventas() {
    const { F, Fa, hayAnt, empresa } = ctx;
    const venta = sum(F.ventas_diarias, 'venta');
    const dias = new Set(F.ventas_diarias.map((r) => r.fecha)).size;
    const canc = sum(F.cancelaciones, 'monto'), dev = sum(F.devoluciones, 'monto');
    const ops = F.clientes.length;
    kpis('ven-kpis', [
      { id: 'venta', l: 'Venta', v: $c(venta), s: delta(venta, hayAnt ? sum(Fa.ventas_diarias, 'venta') : null) || '' },
      { id: 'dia', l: 'Venta promedio por día', v: $c(venta / Math.max(1, dias)), s: dias + ' días con venta' },
      { id: 'efe', l: 'Cobrado en efectivo', v: pct(sum(F.ventas_diarias, 'efectivo') / venta), s: $c(sum(F.ventas_diarias, 'efectivo')) },
      { id: 'tar', l: 'Cobrado con tarjeta', v: pct(sum(F.ventas_diarias, (r) => r.debito + r.credito) / venta), s: $c(sum(F.ventas_diarias, (r) => r.debito + r.credito)) },
      { id: 'canc', l: 'Cancelaciones', v: pct(canc / venta), s: F.cancelaciones.length + ' notas · ' + $c(canc) },
      { id: 'dev', l: 'Cambios y devoluciones', v: $c(dev), s: F.devoluciones.length + ' notas' },
    ]);
    const ts = TIENDAS.filter((t) => empresa || t === ctx.tienda).map((t) => ({ nombre: t, color: colorTienda(t), t }));
    leyenda('ven-periodo-ley', ts);
    const m = sumBy(F.ventas_diarias, (x) => periodo(x.fecha, ctx.agr).k + '|' + x.tienda, 'venta');
    barras('ven-periodo', periodos(F.ventas_diarias), ts, (c, s) => m.get(c.k + '|' + s.t) || 0);
    // mezcla
    const partes = [
      { k: 'efectivo', nombre: 'Efectivo', color: color(0) }, { k: 'debito', nombre: 'T. débito', color: color(1) },
      { k: 'credito', nombre: 'T. crédito', color: color(2) }, { k: 'transferencias', nombre: 'Transferencia', color: color(3) },
      { k: 'otros', nombre: 'Otros y cheques', color: color(4) }, { k: 'ajustes', nombre: 'Crédito / a cuenta / ajustes', color: color(5) },
    ];
    const tot = (rows) => ({ efectivo: sum(rows, 'efectivo'), debito: sum(rows, 'debito'), credito: sum(rows, 'credito'), transferencias: sum(rows, 'transferencias'),
      otros: sum(rows, (r) => r.otros + r.cheques), ajustes: sum(rows, 'credito_a_cuenta_ajustes') });
    leyenda('ven-mix-ley', partes);
    const filas = (empresa ? TIENDAS : [ctx.tienda]).map((t) => ({ l: t, v: tot(F.ventas_diarias.filter((r) => r.tienda === t)) }));
    if (empresa) filas.push({ l: 'Total', v: tot(F.ventas_diarias) });
    mezcla('ven-mix-chart', filas, partes);
    const T = tot(F.ventas_diarias);
    const nOps = { efectivo: F.clientes.filter((c) => c.efectivo > 0).length, debito: F.clientes.filter((c) => c.debito > 0).length,
      credito: F.clientes.filter((c) => c.credito > 0).length, transferencias: F.clientes.filter((c) => c.transferencia > 0).length };
    tabla('ven-mix', [
      { k: 'forma', l: 'Forma de pago' }, { k: 'monto', l: 'Monto', num: true, f: $, sumar: true },
      { k: 'pct', l: '% venta', num: true, f: pct }, { k: 'ops', l: 'Operaciones', num: true, f: (v) => (v == null ? '—' : ent.format(v)) },
    ], partes.map((p) => ({ forma: p.nombre, monto: T[p.k], pct: T[p.k] / venta, ops: p.k === 'efectivo' ? null : nOps[p.k] ?? null })), { total: true });
    // vendedores
    const v = sumBy(F.vendedores, (r) => r.vendedor + '|' + r.tienda, 'monto');
    barrasH('ven-vend', [...v].sort((a, b) => b[1] - a[1]).map(([k, val]) => { const [n, t] = k.split('|'); return { l: n + ' · ' + t, v: val, c: colorTienda(t), s: pct(val / venta) }; }));
    // día de la semana
    const porDia = sumBy(F.ventas_diarias, (r) => r.fecha, 'venta');
    const dw = DOW.map((d, i) => { const vals = [...porDia].filter(([f]) => (dia(f).getUTCDay() + 6) % 7 === i).map((x) => x[1]); return { k: d, l: d, v: vals.length ? d3.mean(vals) : 0 }; }).filter((x) => x.v);
    barras('ven-dow', dw, [{ nombre: 'Promedio', color: color(0) }], (c) => c.v, { alto: 200, fmtTip: $ });
    // cancelaciones
    const ct = (empresa ? TIENDAS : [ctx.tienda]).map((t) => {
      const cs = F.cancelaciones.filter((c) => c.tienda === t), vt = sum(F.ventas_diarias.filter((r) => r.tienda === t), 'venta');
      const g = sum(cs.filter((c) => /global/i.test(c.tipo)), 'monto');
      return { tienda: t, n: cs.length, global: g, error: sum(cs, 'monto') - g, pct: (sum(cs, 'monto') - g) / vt, dev: sum(F.devoluciones.filter((d) => d.tienda === t), 'monto') };
    });
    tabla('ven-canc', [
      { k: 'tienda', l: 'Sucursal' }, { k: 'n', l: 'Notas', num: true, sumar: true },
      { k: 'global', l: 'Global (refacturar)', num: true, f: $, sumar: true }, { k: 'error', l: 'Error', num: true, f: $, sumar: true },
      { k: 'pct', l: 'Error % venta', num: true, f: pct }, { k: 'dev', l: 'Devoluciones', num: true, f: $, sumar: true },
    ], ct, { total: empresa });
    // clientes
    const cl = new Map();
    F.clientes.forEach((c) => {
      const k = c.cliente || '(sin nombre)'; const o = cl.get(k) || { cliente: k, notas: new Set(), monto: 0, tiendas: new Set() };
      o.notas.add(c.tienda + c.nota); o.monto += c.efectivo + c.transferencia + c.debito + c.credito; o.tiendas.add(c.tienda); cl.set(k, o);
    });
    tabla('ven-clientes', [
      { k: 'cliente', l: 'Cliente' }, { k: 'tiendas', l: 'Sucursal' }, { k: 'notas', l: 'Notas', num: true },
      { k: 'monto', l: 'Monto', num: true, f: $ }, { k: 'pct', l: '% venta', num: true, f: pct },
    ], [...cl.values()].map((o) => ({ cliente: o.cliente, tiendas: [...o.tiendas].join(', '), notas: o.notas.size, monto: o.monto, pct: o.monto / venta })),
    { buscar: true, orden: 'monto', alto: '22rem' });
  }

  // 3. Egresos de tienda
  function egresos() {
    const { F, Fa, hayAnt, empresa } = ctx;
    const venta = sum(F.ventas_diarias, 'venta');
    const tot = sum(F.egresos_tienda, 'monto');
    const op = sum(F.egresos_tienda.filter((r) => !NO_GASTO.has(r.categoria)), 'monto');
    const opA = hayAnt ? sum(Fa.egresos_tienda.filter((r) => !NO_GASTO.has(r.categoria)), 'monto') : null;
    const cat = sumBy(F.egresos_tienda, (r) => r.categoria, 'monto');
    kpis('egr-kpis', [
      { id: 'tot', l: 'Egresos de tienda', v: $c(tot), s: F.egresos_tienda.length + ' movimientos' },
      { id: 'op', l: 'Egresos operativos', v: $c(op), s: delta(op, opA, false) || 'Sin facturación, retiros ni cancelaciones' },
      { id: 'pct', l: 'Operativos / venta', v: pct(op / venta), s: 'Venta ' + $c(venta) },
      { id: 'sue', l: 'Sueldos', v: $c(cat.get('Sueldos') || 0), s: pct((cat.get('Sueldos') || 0) / venta) + ' de la venta' },
      { id: 'ren', l: 'Renta', v: $c(cat.get('Renta') || 0), s: pct((cat.get('Renta') || 0) / venta) + ' de la venta' },
      { id: 'gop', l: 'Gasto operativo', v: $c(cat.get('Gasto operativo') || 0), s: pct((cat.get('Gasto operativo') || 0) / venta) + ' de la venta' },
    ]);
    barrasH('egr-cat', CATS.filter((c) => cat.get(c)).map((c) => ({ l: c, v: cat.get(c), c: colorCat(c), s: pct(cat.get(c) / tot) })).sort((a, b) => b.v - a.v));
    const ts = empresa ? TIENDAS : [ctx.tienda];
    const cats = CATS.filter((c) => cat.get(c));
    const vt = new Map(ts.map((t) => [t, sum(F.ventas_diarias.filter((r) => r.tienda === t), 'venta')]));
    const filas = cats.map((c) => Object.fromEntries([['cat', c], ...ts.map((t) => [t, sum(F.egresos_tienda.filter((r) => r.tienda === t && r.categoria === c), 'monto')])]));
    filas.push(Object.fromEntries([['cat', 'Operativos'], ...ts.map((t) => [t, sum(F.egresos_tienda.filter((r) => r.tienda === t && !NO_GASTO.has(r.categoria)), 'monto')])]));
    filas.push(Object.fromEntries([['cat', 'Operativos % venta'], ...ts.map((t) => [t, null])]));
    tabla('egr-mat', [{ k: 'cat', l: 'Categoría' }, ...ts.map((t) => ({ k: t, l: t, num: true,
      f: (v, r) => (r.cat === 'Operativos % venta' ? pct(filas[filas.length - 2][t] / vt.get(t)) : $(v)) }))], filas);
    const series = cats.map((c) => ({ nombre: c, color: colorCat(c), c }));
    leyenda('egr-periodo-ley', series);
    const m = sumBy(F.egresos_tienda, (r) => periodo(r.fecha, ctx.agr).k + '|' + r.categoria, 'monto');
    barras('egr-periodo', periodos(F.egresos_tienda), series, (c, s) => m.get(c.k + '|' + s.c) || 0);
    tabla('egr-tabla', [
      { k: 'fecha', l: 'Fecha', f: fdc }, { k: 'tienda', l: 'Sucursal' }, { k: 'folio', l: 'Folio' }, { k: 'concepto', l: 'Concepto' },
      { k: 'categoria', l: 'Categoría' }, { k: 'monto', l: 'Monto', num: true, f: mxn2.format },
    ], F.egresos_tienda, { buscar: true, orden: 'monto' });
  }

  // 4. Rentabilidad por sucursal
  function rentabilidad() {
    const { F, Fe } = ctx;
    const ts = ctx.empresa ? TIENDAS : [ctx.tienda];
    const filas = ts.map((t) => {
      const sel = (rows) => rows.filter((r) => r.tienda === t);
      const Ft = { ...F, ventas_diarias: sel(F.ventas_diarias), egresos_tienda: sel(F.egresos_tienda) };
      const r = pyl(Ft, Fe), eg = Ft.egresos_tienda;
      return { tienda: t, venta: r.venta, part: r.parte,
        sueldos: sum(eg.filter((x) => x.categoria === 'Sueldos'), 'monto'), renta: sum(eg.filter((x) => x.categoria === 'Renta'), 'monto'),
        gasto: sum(eg.filter((x) => x.categoria === 'Gasto operativo'), 'monto'), op: r.egrOp, opct: r.egrOp / r.venta,
        asign: r.compras + r.centrales + r.servicios, util: r.util, upct: r.util / r.venta };
    });
    tabla('ren-tabla', [
      { k: 'tienda', l: 'Sucursal' }, { k: 'venta', l: 'Venta', num: true, f: $, sumar: true }, { k: 'part', l: '% de la venta total', num: true, f: pct },
      { k: 'sueldos', l: 'Sueldos', num: true, f: $, sumar: true }, { k: 'renta', l: 'Renta', num: true, f: $, sumar: true },
      { k: 'gasto', l: 'Gasto operativo', num: true, f: $, sumar: true }, { k: 'op', l: 'Egresos de tienda', num: true, f: $, sumar: true },
      { k: 'opct', l: 'Egresos % venta', num: true, f: pct },
      { k: 'asign', l: 'Mercancía y gastos asignados', num: true, f: $, sumar: true }, { k: 'util', l: 'Utilidad estimada', num: true, f: $, sumar: true },
      { k: 'upct', l: 'Utilidad %', num: true, f: pct },
    ], filas, { total: ctx.empresa });
    barrasH('ren-egr', filas.map((f) => ({ l: f.tienda, v: f.opct, c: f.opct > UMBRALES.egresosTienda ? 'var(--cds-chart-status-critical)' : colorTienda(f.tienda), s: $c(f.op) })), pct,
      Math.max(UMBRALES.egresosTienda * 1.5, d3.max(filas, (f) => f.opct) || 0));
    byId('ren-egr-note').textContent = `Cuánto gasta cada tienda por cada peso que vende. Límite de referencia: ${pct(UMBRALES.egresosTienda)} (se pinta en rojo si lo rebasa).`;
    barrasH('ren-util', filas.map((f) => ({ l: f.tienda, v: f.upct, c: colorTienda(f.tienda), s: $c(f.util) })), pct);
    const series = [{ nombre: 'Sueldos', color: colorCat('Sueldos'), k: 'sueldos' }, { nombre: 'Renta', color: colorCat('Renta'), k: 'renta' }, { nombre: 'Gasto operativo', color: colorCat('Gasto operativo'), k: 'gasto' }];
    leyenda('ren-costos-ley', series);
    barras('ren-costos', filas.map((f) => ({ k: f.tienda, l: f.tienda, f })), series, (c, s) => (c.f.venta ? c.f[s.k] / c.f.venta : 0), { agrupado: true, fmt: (v) => pct(v), fmtTip: pct, alto: 220 });
  }

  // 5. Efectivo
  function efectivo() {
    const { F, empresa } = ctx;
    const entr = sum(F.efectivo_entradas, 'monto'), sal = sum(F.efectivo_salidas, 'monto');
    const depB = sum(F.efectivo_depositos.filter((d) => /banamex/i.test(d.destino)), 'monto');
    const depO = sum(F.efectivo_depositos.filter((d) => !/banamex/i.test(d.destino)), 'monto');
    kpis('efe-kpis', [
      { id: 'ent', l: 'Efectivo recibido de tiendas', v: $c(entr), s: F.efectivo_entradas.length + ' entregas' + (empresa ? '' : ' · ' + ctx.tienda) },
      { id: 'sal', l: 'Salidas de efectivo', v: $c(sal), s: F.efectivo_salidas.length + ' salidas (toda la empresa)' },
      { id: 'depb', l: 'Depositado a Banamex', v: $c(depB), s: F.efectivo_depositos.filter((d) => /banamex/i.test(d.destino)).length + ' depósitos' },
      { id: 'depo', l: 'Depositado a otras cuentas', v: $c(depO), s: F.efectivo_depositos.filter((d) => !/banamex/i.test(d.destino)).length + ' depósitos' },
      { id: 'neto', l: 'Recibido − salidas − depósitos', v: $c(entr - sal - depB - depO), s: empresa ? 'Debe acercarse a cero al cierre' : 'Con sucursal no cuadra: salidas y depósitos son globales' },
    ]);
    const series = [{ nombre: 'Recibido', color: color(0), k: 'e' }, { nombre: 'Salidas', color: color(4), k: 's' }, { nombre: 'Depósitos', color: color(3), k: 'd' }];
    leyenda('efe-periodo-ley', series);
    const me = porPeriodo(F.efectivo_entradas, 'monto'), ms = porPeriodo(F.efectivo_salidas, 'monto'), md = porPeriodo(F.efectivo_depositos, 'monto');
    const cats = periodos([...F.efectivo_entradas, ...F.efectivo_salidas, ...F.efectivo_depositos]);
    barras('efe-periodo', cats, series, (c, s) => ({ e: me, s: ms, d: md })[s.k].get(c.k) || 0, { agrupado: true });
    const cat = sumBy(F.efectivo_salidas, (r) => r.categoria, 'monto');
    barrasH('efe-cat', [...cat].sort((a, b) => b[1] - a[1]).map(([c, v]) => ({ l: c, v, c: colorCat(c), s: pct(v / sal) })));
    const ts = empresa ? TIENDAS : [ctx.tienda];
    const ent = sumBy(F.efectivo_entradas, (x) => x.tienda, 'monto'), esp = sumBy(F.ventas_diarias, (x) => x.tienda, 'efectivo_entregar');
    tabla('efe-cuadre', [
      { k: 'tienda', l: 'Sucursal' }, { k: 'esp', l: 'A entregar (corte)', num: true, f: $, sumar: true },
      { k: 'rec', l: 'Recibido', num: true, f: $, sumar: true }, { k: 'dif', l: 'Diferencia', num: true, f: (v) => h('span', { class: Math.abs(v) > 500 ? 'sp-neg' : null }, $(v)), sumar: true },
    ], ts.map((t) => ({ tienda: t, esp: esp.get(t) || 0, rec: ent.get(t) || 0, dif: (ent.get(t) || 0) - (esp.get(t) || 0) })), { total: empresa });
    tabla('efe-tabla', [
      { k: 'fecha', l: 'Fecha', f: fdc }, { k: 'tipo', l: 'Tipo' }, { k: 'concepto', l: 'Concepto' }, { k: 'categoria', l: 'Categoría / destino' },
      { k: 'monto', l: 'Monto', num: true, f: mxn2.format },
    ], [...F.efectivo_salidas.map((r) => ({ ...r, tipo: 'Salida' })), ...F.efectivo_depositos.map((r) => ({ ...r, tipo: 'Depósito', categoria: r.destino }))]
      .sort((a, b) => (a.fecha < b.fecha ? -1 : 1)), { buscar: true });
  }

  // 6. Compras Sayer
  function sayer() {
    const { F, Fa, hayAnt } = ctx;
    const fs = F.sayer_facturas;
    const bruto = sum(fs.filter((r) => r.monto > 0), 'monto'), nc = -sum(fs.filter((r) => r.monto < 0), 'monto');
    const desc = sum(fs, 'descuento'), neto = sum(fs, 'monto') - desc;
    const pag = fs.filter((r) => r.dias_a_pago != null);
    const venta = sum(filtro(ctx.D, ctx.desde, ctx.hasta, 'Todas').ventas_diarias, 'venta');
    const netoA = hayAnt ? sum(Fa.sayer_facturas, 'monto') - sum(Fa.sayer_facturas, 'descuento') : null;
    kpis('say-kpis', [
      { id: 'n', l: 'Facturas', v: ent.format(fs.filter((r) => r.monto > 0).length), s: fs.filter((r) => r.monto < 0).length + ' notas de crédito' },
      { id: 'bruto', l: 'Monto facturado', v: $c(bruto), s: nc ? 'Notas de crédito ' + $c(nc) : 'Sin notas de crédito' },
      { id: 'desc', l: 'Descuento', v: $c(desc), s: pct(desc / bruto) + ' del monto' },
      { id: 'neto', l: 'Neto a pagar', v: $c(neto), s: delta(neto, netoA, false) || pct(neto / venta) + ' de la venta total' },
      { id: 'pagado', l: 'Pagado a Sayer', v: $c(sum(F.sayer_pagos, 'monto')), s: F.sayer_pagos.length + ' pagos en el periodo' },
      { id: 'dias', l: 'Días factura → pago', v: num.format(d3.mean(pag, (r) => r.dias_a_pago) || 0), s: (fs.length - pag.length) + ' sin pago registrado' },
    ]);
    const series = [{ nombre: 'Neto pagado', color: color(0), k: 'n' }, { nombre: 'Descuento', color: color(2), k: 'd' }];
    leyenda('say-periodo-ley', series);
    const mn = porPeriodo(fs, (r) => r.monto - r.descuento), md = porPeriodo(fs, 'descuento');
    barras('say-periodo', periodos(fs), series, (c, s) => (s.k === 'n' ? mn : md).get(c.k) || 0);
    const rangos = [['0 a 2 días', 0, 2], ['3 a 5 días', 3, 5], ['6 a 10 días', 6, 10], ['Más de 10 días', 11, 1e9]];
    const filas = rangos.map(([l, a, b], i) => ({ l, v: pag.filter((r) => r.dias_a_pago >= a && r.dias_a_pago <= b).length, c: color(i) }));
    if (fs.length - pag.length) filas.push({ l: 'Sin pago registrado', v: fs.length - pag.length, c: 'var(--cds-chart-status-critical)' });
    barrasH('say-dias', filas, (v) => ent.format(v) + ' fact.');
    tabla('say-pagos', [
      { k: 'fecha', l: 'Fecha', f: fdc }, { k: 'facturas', l: 'Facturas', num: true, sumar: true }, { k: 'monto', l: 'Monto', num: true, f: $, sumar: true },
    ], F.sayer_pagos, { total: true, alto: '18rem' });
    tabla('say-tabla', [
      { k: 'fecha', l: 'Fecha', f: fdc }, { k: 'factura', l: 'Factura' }, { k: 'monto', l: 'Monto', num: true, f: mxn2.format },
      { k: 'descuento', l: 'Descuento', num: true, f: mxn2.format }, { k: 'neto', l: 'Neto', num: true, f: mxn2.format },
      { k: 'fecha_pago', l: 'Pagada', f: (v) => (v ? fdc(v) : 'Pendiente') }, { k: 'dias_a_pago', l: 'Días', num: true, f: (v) => (v == null ? '—' : v) },
    ], fs.map((r) => ({ ...r, neto: r.monto - r.descuento })), { buscar: true });
  }

  // 7. Proveedores
  function proveedores() {
    const { F } = ctx;
    const ps = F.proveedores;
    const imp = sum(ps, 'importe'), desc = sum(ps, 'descuento'), pagado = sum(ps, 'pagado');
    kpis('pro-kpis', [
      { id: 'n', l: 'Órdenes / facturas', v: ent.format(ps.length), s: new Set(ps.map((r) => r.proveedor)).size + ' proveedores' },
      { id: 'imp', l: 'Importe', v: $c(imp), s: 'Antes de descuento' },
      { id: 'desc', l: 'Descuento', v: $c(desc), s: pct(desc / imp) + ' del importe' },
      { id: 'pag', l: 'Pagado', v: $c(pagado), s: ps.filter((r) => r.pagado > 0).length + ' órdenes pagadas' },
      { id: 'merc', l: 'Mercancía (sin Sayer)', v: $c(sum(ps.filter((r) => r.tipo === 'Mercancía'), 'importe')), s: ps.filter((r) => r.tipo === 'Mercancía').length + ' órdenes' },
    ]);
    const g = new Map();
    ps.forEach((r) => { const o = g.get(r.proveedor) || { proveedor: r.proveedor, tipo: r.tipo, n: 0, imp: 0, desc: 0, pag: 0, formas: new Set() };
      o.n++; o.imp += r.importe; o.desc += r.descuento || 0; o.pag += r.pagado || 0; o.formas.add(r.forma_pago); g.set(r.proveedor, o); });
    const vs = [...g.values()];
    const top = [...vs].sort((a, b) => (modoTop === 'monto' ? b.imp - a.imp : b.n - a.n || b.imp - a.imp)).slice(0, 10);
    barrasH('pro-top', top.map((o) => ({ l: o.proveedor, v: modoTop === 'monto' ? o.imp : o.n, c: color(['Mercancía', 'Servicios', 'Impuestos', 'Pago de tarjeta'].indexOf(o.tipo)),
      s: modoTop === 'monto' ? o.n + ' órd.' : $c(o.imp) })), modoTop === 'monto' ? $ : (v) => ent.format(v) + ' órd.');
    const tipos = ['Mercancía', 'Servicios', 'Impuestos', 'Pago de tarjeta'];
    barrasH('pro-tipo', tipos.map((t, i) => ({ l: t, v: sum(ps.filter((r) => r.tipo === t), 'importe'), c: color(i), s: ps.filter((r) => r.tipo === t).length + ' órd.' })).filter((x) => x.v));
    const fp = sumBy(ps, (r) => r.forma_pago || 'Sin dato', 'importe');
    barrasH('pro-forma', [...fp].sort((a, b) => b[1] - a[1]).map(([f, v], i) => ({ l: 'Pago ' + f.toLowerCase(), v, c: color(4 + i), s: pct(v / imp) })));
    tabla('pro-tabla', [
      { k: 'proveedor', l: 'Proveedor' }, { k: 'tipo', l: 'Tipo' }, { k: 'formas', l: 'Forma de pago' }, { k: 'n', l: 'Órdenes', num: true, sumar: true },
      { k: 'imp', l: 'Importe', num: true, f: $, sumar: true }, { k: 'desc', l: 'Descuento', num: true, f: $, sumar: true }, { k: 'pag', l: 'Pagado', num: true, f: $, sumar: true },
    ], vs.map((o) => ({ ...o, formas: [...o.formas].join(', ') })), { buscar: true, orden: 'imp', total: true });
  }

  // ---------- arranque
  document.querySelectorAll('.sp-kpis, .sp-chart, .sp-hbars, .sp-diag').forEach((el) => el.classList.add('dash-skeleton'));
  const inicial = location.hash.slice(1);
  mostrar(byId(inicial) && byId(inicial).classList.contains('sp-page') ? inicial : 'resumen', false);
  dash.onData(() => {
    const st = DS.map((k) => dash.data(k).status);
    if (st.some((s) => s === 'error' || s === 'missing')) {
      document.querySelectorAll('.dash-skeleton').forEach((el) => {
        el.classList.remove('dash-skeleton');
        el.replaceChildren(h('span', { class: 'sp-empty' }, h('span', { class: 'sp-sw', style: 'background:var(--color-bad);border-radius:50%' }), ' Failed to load'));
      });
      return;
    }
    dibujar();
  });
})();
````
