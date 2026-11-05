---
name: "conciliacion-mensual-sayer"
description: "Concilia el cierre mensual de SayerPro (Banamex, Santander, Resúmenes de Venta de las 3 tiendas, VENTAS AL DIA, pagos a Sayer y proveedores) y regresa el SAYER VENTAS llenado con pestaña de pendientes."
---

# Conciliación mensual SayerPro

Automatiza la parte manual y repetitiva de la conciliación mensual de Max. Recibe el libro **SAYER VENTAS** (pestañas VENTAS AL DIA, SAYER FRIDA PAGOS, PROVEDORES, CTA FRIDA BMEX, CTA FRIDA SANTANDER) y los **Resúmenes de Venta** de las tres tiendas (cierres diarios), y regresa una **copia del libro** con las columnas DOCUMENTO de CTA FRIDA BMEX y CTA FRIDA SANTANDER llenas para el periodo indicado, más dos pestañas nuevas: `PENDIENTES <MES>` y `CONTROL <MES>`.

Lo que no se puede cruzar con reglas (notas canceladas y refacturadas, cobranza de crédito, diferencias de efectivo, etc.) se deja en PENDIENTES para que Max lo revise: esa parte sigue siendo manual a propósito.

## Cruces que hace

1. **Santander abono por afiliación ↔ venta con tarjeta del día** (T/Débito + T/Crédito del Resumen de esa tienda). Afiliaciones: 9731247 Santa Rosa, 9731294 Cuautepec, 9731129 Tlalne; desde la semana 42 de 2026 Santa Rosa también cobra con 8581544 (el script lo lee del encabezado de CTA FRIDA SANTANDER, p. ej. "SANTAROSA 8581544 semana 42"). 8581757 (Entregas Sayer) no tiene Resumen.
2. **Santander traspaso "AFI …" ↔ grupo de abonos** de esa afiliación (1 a 3 abonos). Los sábados no hay abono: el lunes llegan dos (viernes y sábado) por afiliación y se traspasan sumados. En CTA FRIDA SANTANDER cada abono lleva en F/G las notas con tarjeta de su día de venta, y la suma (H) y la etiqueta (I) van **una sola vez**, en el último abono del grupo.
3. **Banamex depósito interbancario ↔ traspaso AFI de Santander** (mismo monto, 0-5 días después). En el renglón del depósito va solo la etiqueta (p. ej. "AFI 9731129 2 DEPOSITOS DEL 12 DE OCTUBRE 2026") y el script **inserta 1 o 2 renglones debajo** (uno por día de venta) con el detalle: E = notas con T/Crédito, F = notas con T/Débito, en verde. Si el depósito ya tiene renglones de detalle debajo, no inserta. Todas las fórmulas que apuntan a CTA FRIDA BMEX se ajustan a los renglones insertados (validado: 97 de 97 fórmulas dan el mismo resultado). Si una etiqueta AFI capturada a mano es de otra afiliación que la que indica Santander, se reporta como "Etiqueta AFI no coincide".
4. **Banamex transferencias de clientes ↔ líneas "03 - Transferencia" de los Resúmenes** (monto exacto; montos repetidos se asignan en orden cronológico; un depósito que cubre varias notas; mismo cliente con fecha alejada; notas COBRANZA/CANCELADAS como último recurso, marcadas en amarillo).
5. **Banamex depósitos de efectivo ↔ renglones "DEPOSITO … BANAMEX" de VENTAS AL DIA** (incluye "2 DEPOSITOS ($X Y $Y)").
6. **VENTAS AL DIA por tienda-día ↔ "Efectivo a Entregar"** (tolerancia por defecto ±$10; detecta días capturados intercambiados y años mal capturados como 2027).
7. **Banamex pagos a Sayer ↔ columna J de SAYER FRIDA PAGOS**, validando J = Σ facturas (B) − Σ descuento (K) − notas de crédito (I). Las notas de crédito de Sayer van en negativo en B y sin descuento en K.
8. **Banamex pagos a proveedores ↔ PROVEDORES** (solo forma de pago TRANSFERENCIA; agrupa por proveedor y fecha de pago).

Colores que escribe: azul = transferencia conciliada; verde = detalle de notas con tarjeta; mismo color pastel en Santander (E de cada abono, H/I del grupo, G de sus comisiones, F del traspaso) y en Banamex (E del depósito) = mismo traspaso AFI; si Max ya le dio color a un grupo (aunque sea color de tema de Excel) se reutiliza ese mismo color para que E y H coincidan uno a uno; amarillo = conciliado con observación; rojo con texto "PENDIENTE: …" = sin match.

## Cómo ejecutarla

1. **Identifica los archivos** adjuntos: el libro SAYER VENTAS (.xlsx con las 5 pestañas) y los Resúmenes de Venta (.xlsx o .xls; la tienda se detecta por el nombre del archivo o por el prefijo de factura: TL- = Tlalne, A- = Cuautepec, numérico = Santa Rosa). Se pueden pasar Resúmenes de más de un mes (p. ej. el último día del mes anterior) y ayudan a cruzar los abonos del día 1.
2. **Periodo**: usa el mes que diga Max ("concilia octubre" → `--periodo 2026-10`). Si no lo dice, el script lo toma del encabezado "Desde/Hasta" de los Resúmenes; confírmalo en la respuesta. El libro SAYER VENTAS trae varios meses; solo se tocan renglones dentro del periodo.
3. **Prepara el entorno** (una vez por sesión):
   ```bash
   python3 -c "import openpyxl, xlrd" 2>/dev/null || pip install openpyxl xlrd --break-system-packages -q
   ```
4. **Escribe el script** de la sección "Script" de abajo, tal cual, en `conciliar.py` dentro del directorio de trabajo (no en la carpeta de los adjuntos).
5. **Copia los adjuntos** al directorio de trabajo (no se modifican los originales) y ejecuta:
   ```bash
   python3 conciliar.py --ventas SAYER_VENTAS.xlsx \
       --resumen ResumenSantaRosa.xlsx ResumenCuautepec.xlsx ResumenTlalne.xls \
       --periodo 2026-10 \
       --salida SAYER_VENTAS_<Mes>_CONCILIADO.xlsx
   ```
   Opciones: `--tolerancia 10` (pesos, efectivo tienda-día), `--rehacer` (borra y vuelve a llenar las columnas DOCUMENTO del periodo; úsalo si Max pide rehacer un mes ya trabajado), `--sobrescribir` (escribe aunque la celda ya tenga texto), `--desde dd/mm/aaaa --hasta dd/mm/aaaa` (rango distinto a un mes).
   Por defecto solo llena celdas vacías (o con una marca "PENDIENTE:" de una corrida anterior), así que no pisa lo que Max haya escrito a mano.
6. **Revisa la salida de consola**: el bloque RESUMEN da conciliados/total por cruce y el número de pendientes. Si algún cruce sale en 0 o muy bajo, revisa primero que las pestañas y columnas sigan en el mismo lugar (A fecha, B descripción, C depósitos, D retiros en BMEX; A fecha, C concepto, D cargos, E abonos en Santander) antes de entregar.
7. **Entrega** el archivo de salida con SendUserFile y responde en español, breve: periodo conciliado, tabla corta de conciliados/total por cruce, cuántos pendientes y las 3-5 categorías principales de pendientes con montos relevantes. No repitas la lista completa: está en la pestaña PENDIENTES.

## Notas

- Si el libro llega sin valores calculados en las fórmulas (guardado por un programa que no es Excel), el script los recalcula con LibreOffice solo para leerlos y lo avisa.
- El archivo de salida conserva todas las pestañas y formatos; Excel recalcula las fórmulas al abrirlo.
- Para agregar una afiliación nueva, edita `AFILIACIONES` al inicio del script (o ponla en el encabezado de CTA FRIDA SANTANDER como "TIENDA 9999999").
- El libro SAYER VENTAS puede traer todo el historial (desde 2022): el script solo usa movimientos bancarios, pagos y facturas de proveedores cercanos al periodo (±15-30 días), así que no genera pendientes de años anteriores.
- No se reportan como pendientes los movimientos bancarios que ya tienen DOCUMENTO capturado a mano (aunque el script no los haya podido cruzar); el CONTROL dice cuántos se omitieron por eso.
- Para conciliar una parte del mes (p. ej. una quincena) usa `--desde 01/10/2026 --hasta 16/10/2026`. Los días al final del rango aparecerán como "aún no se refleja" o "sin registro en VENTAS AL DIA" si todavía no se capturan; es normal.
- Si se tienen a la mano los Resúmenes del mes anterior (de una corrida previa en la misma conversación), pásalos también en `--resumen`: ayudan a cruzar abonos y transferencias de los primeros días.
- Validado contra la conciliación manual de septiembre 2026: 332 de 356 celdas de Banamex idénticas a las de Max, el resto equivalentes (misma nota/afiliación, etiqueta distinta) o pendientes legítimos; ningún cruce incorrecto.

## Script

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Conciliación mensual SayerPro Soluciones — parte manual y repetitiva.

Cruza:
  1. Santander: abonos por afiliación  <->  T/Débito + T/Crédito de los Resúmenes de Venta
  2. Santander: traspasos "AFI ..."     <->  grupo de abonos de esa afiliación
  3. Banamex: depósitos interbancarios  <->  traspasos AFI de Santander
  4. Banamex: transferencias de clientes <-> líneas "03 - Transferencia" de los Resúmenes
  5. Banamex: depósitos de efectivo     <->  renglones "DEPOSITO ... BANAMEX" de VENTAS AL DIA
  6. VENTAS AL DIA (entradas por tienda-día) <-> "Efectivo a Entregar" de los Resúmenes
  7. Banamex: pagos a Sayer             <->  columna J de SAYER FRIDA PAGOS (+ valida J = ΣB − ΣK − ΣI)
  8. Banamex: pagos a proveedores       <->  PROVEDORES (forma de pago TRANSFERENCIA)

Llena las columnas DOCUMENTO de CTA FRIDA BMEX y CTA FRIDA SANTANDER (solo celdas vacías,
solo renglones dentro del periodo) en una COPIA del archivo y agrega dos pestañas:
PENDIENTES <MES> y CONTROL <MES>.

Uso:
  python3 conciliar.py --ventas SAYER_VENTAS.xlsx --resumen R1.xlsx R2.xlsx R3.xls \
      --periodo 2026-09 --salida SAYER_VENTAS_CONCILIADO.xlsx [--tolerancia 10] [--sobrescribir] [--rehacer]
"""
import argparse
import datetime as dt
import itertools
import os
import re
import sys
import unicodedata
from collections import defaultdict

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

# --------------------------------------------------------------------------------------
# Configuración
# --------------------------------------------------------------------------------------
TIENDAS = ("SANTA ROSA", "CUAUTEPEC", "TLALNE")
ALIAS_TIENDA = {
    "SANTA ROSA": "SANTA ROSA", "SANTAROSA": "SANTA ROSA", "STA ROSA": "SANTA ROSA",
    "CUAUTEPEC": "CUAUTEPEC", "CUATEPEC": "CUAUTEPEC", "CUAUTE": "CUAUTEPEC", "CUAUT": "CUAUTEPEC",
    "TLALNE": "TLALNE", "TLALNEPANTLA": "TLALNE", "TLANE": "TLALNE",
}
# Afiliaciones de terminal (se complementan con lo que diga el encabezado de CTA SANTANDER)
AFILIACIONES = {"9731247": "SANTA ROSA", "9731294": "CUAUTEPEC", "9731129": "TLALNE"}
AFILIACIONES_SIN_RESUMEN = {"8581544": "SANTA ROSA (2)", "8581757": "ENTREGAS SAYER"}
CUOTAS_FIJAS = {32.0, 200.0}  # cargos fijos mensuales por afiliación

HOJA_VENTAS = "VENTAS AL DIA"
HOJA_SAYER = "SAYER FRIDA PAGOS"
HOJA_PROV = "PROVEDORES"
HOJA_BMEX = "CTA FRIDA BMEX"
HOJA_SANT = "CTA FRIDA SANTANDER"

MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO",
         "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
MESES_CORTO = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
MES_TXT = {
    "ene": 1, "jan": 1, "feb": 2, "mar": 3, "abr": 4, "apr": 4, "may": 5, "jun": 6, "jul": 7,
    "ago": 8, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dic": 12, "dec": 12,
}

# Colores
AZUL_TRANSF = "00B0F0"      # transferencias de clientes (como hoy)
VERDE_DETALLE = "92D050"    # detalle de notas con tarjeta (como hoy)
ROJO_PEND = "FFC7CE"        # sin match -> revisar
AMARILLO_REV = "FFEB9C"     # match con observación -> revisar
PALETA_AFI = ["FF33CC", "9999FF", "CCFFCC", "FFCCFF", "E97132", "339966", "0099CC",
              "FFC000", "33CC33", "CC3399", "00CC66", "7030A0", "D9B3FF", "66CCFF",
              "FF9966", "99CC00", "FF99CC", "6699FF", "FFCC66", "66FFCC"]

EPS = 0.005


def fill(color):
    """color: hex de 6 dígitos o un PatternFill copiado de una celda existente (p. ej. color de tema)."""
    if isinstance(color, PatternFill):
        from copy import copy
        return copy(color)
    return PatternFill("solid", start_color="FF" + color, end_color="FF" + color)


# --------------------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------------------
def sin_acentos(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def num(v):
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        s = v.strip().replace("$", "").replace(",", "")
        try:
            return float(s)
        except ValueError:
            return None
    return None


def money(s):
    return float(s.replace(",", ""))


def parse_fecha(v):
    """Convierte las muchas formas de fecha que hay en el archivo a date. Regresa (date, nota)."""
    if v is None:
        return None, None
    if isinstance(v, dt.datetime):
        return v.date(), None
    if isinstance(v, dt.date):
        return v, None
    if not isinstance(v, str):
        return None, None
    s = v.strip().lower()
    # 01 Sep 2026 / 01/sept/26 / 01-Sep-2026
    m = re.match(r"^(\d{1,2})[\s/\-\.]+([a-zñ]{3,5})\.?[\s/\-\.]+(\d{2,4})$", s)
    if m:
        d, mt, y = m.groups()
        mm = MES_TXT.get(mt[:4]) or MES_TXT.get(mt[:3])
        if mm:
            y = int(y) + (2000 if len(y) == 2 else 0)
            try:
                return dt.date(y, mm, int(d)), None
            except ValueError:
                return None, None
    # 01/09/2026 o 01/09/26
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{2,4})$", s)
    if m:
        d, mm, y = (int(x) for x in m.groups())
        if y < 100:
            y += 2000
        try:
            return dt.date(y, mm, d), None
        except ValueError:
            return None, None
    return None, None


def fmt(d):
    return d.strftime("%d/%m/%Y") if d else ""


def norm_tienda(s):
    if not s:
        return None
    t = sin_acentos(str(s)).upper().strip()
    t = re.sub(r"\s+", " ", t)
    if t in ALIAS_TIENDA:
        return ALIAS_TIENDA[t]
    return None


def etiqueta_afi(afil, n, fecha_abono):
    s = "S" if n > 1 else ""
    return f"AFI {afil} {n} DEPOSITO{s} DEL {fecha_abono.day} DE {MESES[fecha_abono.month - 1]} {fecha_abono.year}"


# --------------------------------------------------------------------------------------
# 1. Resúmenes de Venta
# --------------------------------------------------------------------------------------
PAGO_RE = re.compile(
    r"(?P<cod>\d{2})\s*-\s+(?P<forma>Efectivo|Transferencia|T/Cr[ée]dito|T/D[ée]bito|Cheque|[A-Za-z/]+)"
    r"\s+(?P<acuenta>A CUENTA\s+)?(?:(?P<cta>[0-9A-Z]{3,5})\s+)?\$(?P<monto>[\d,]+\.\d{2})"
)
NOTA_RE = re.compile(r"Nota (\d+)")
FACT_RE = re.compile(r"Factura (\S+)")


def leer_filas_resumen(path):
    ext = os.path.splitext(path)[1].lower()
    filas = []
    if ext == ".xls":
        import xlrd
        book = xlrd.open_workbook(path)
        sh = book.sheet_by_index(0)
        for i in range(sh.nrows):
            filas.append([sh.cell_value(i, j) for j in range(min(sh.ncols, 6))])
    else:
        ws = openpyxl.load_workbook(path, data_only=True, read_only=True).worksheets[0]
        for row in ws.iter_rows(values_only=True):
            filas.append(list(row[:6]))
    return filas


def detectar_tienda(path, filas):
    nombre = sin_acentos(os.path.basename(path)).upper()
    if "SANTA" in nombre or "ROSA" in nombre:
        return "SANTA ROSA"
    if "CUAUT" in nombre or "CUATE" in nombre:
        return "CUAUTEPEC"
    if "TLAL" in nombre:
        return "TLALNE"
    texto = " ".join(str(c) for f in filas[:400] for c in f if c)
    if "Factura TL-" in texto:
        return "TLALNE"
    if "Factura A-" in texto:
        return "CUAUTEPEC"
    return "SANTA ROSA"


def parse_resumen(path):
    filas = leer_filas_resumen(path)
    tienda = detectar_tienda(path, filas)
    # localizar columnas: encabezado 'Fecha','Corte','Conceptos','Importe'
    ci = None
    for i, f in enumerate(filas[:15]):
        vals = [str(x).strip() if x is not None else "" for x in f]
        if "Fecha" in vals and "Importe" in vals:
            ci = (vals.index("Fecha"), vals.index("Corte"), vals.index("Conceptos"), vals.index("Importe"), i)
            break
    if ci is None:
        ci = (1, 2, 3, 4, 3)
    cf, cc, cd, cm, h = ci
    dias = {}
    componentes = []
    desde = hasta = None
    for f in filas[:6]:
        for x in f:
            if isinstance(x, str) and "Desde:" in x:
                m = re.search(r"Desde:\s*(\S+)\s+Hasta:\s*(\S+)", x)
                if m:
                    desde = parse_fecha(m.group(1))[0]
                    hasta = parse_fecha(m.group(2))[0]
    for f in filas[h + 1:]:
        if len(f) <= cm:
            continue
        fecha = parse_fecha(f[cf])[0]
        if not fecha:
            continue
        corte = str(f[cc] or "").strip().upper()
        concepto = str(f[cd] or "").strip()
        imp = num(f[cm]) or 0.0
        d = dias.setdefault(fecha, {"efectivo": 0.0, "debito": 0.0, "credito": 0.0, "transf": 0.0,
                                     "txt_credito": "", "txt_debito": ""})
        if corte == "":
            if concepto == "Efectivo a Entregar":
                d["efectivo"] = imp
                continue
            if concepto == "Total Tarjeta de Débito":
                d["debito"] = imp
                continue
            if concepto == "Total Tarjeta de Crédito":
                d["credito"] = imp
                continue
            if concepto == "Total Transferencias":
                d["transf"] = imp
                continue
            if concepto.startswith("Total "):
                continue
        if not concepto or "$" not in concepto:
            continue
        if corte == "":
            # renglón de detalle: tarjetas (agrupado) o transferencia (uno por nota)
            tiene_cred = "T/Cr" in concepto
            tiene_deb = "T/D" in concepto
            if tiene_cred and abs(imp - d["credito"]) < 0.01 and not d["txt_credito"]:
                d["txt_credito"] = concepto
            elif tiene_deb and abs(imp - d["debito"]) < 0.01 and not d["txt_debito"]:
                d["txt_debito"] = concepto
            elif tiene_cred and not tiene_deb and not d["txt_credito"]:
                d["txt_credito"] = concepto
            elif tiene_deb and not tiene_cred and not d["txt_debito"]:
                d["txt_debito"] = concepto
            fuente = "venta"
        elif corte.startswith("CANCELADAS"):
            fuente = "cancelada"
        elif corte.startswith("COBRANZA"):
            fuente = "cobranza"
        else:
            continue  # ENTREGAS, EGRESOS, etc. (duplican información)
        # componentes de pago con transferencia
        if fuente == "cobranza":
            for m in re.finditer(r"Nota (\d+) Transferencia\s+-\s+(\w+)\s+\$([\d,]+\.\d{2})", concepto):
                componentes.append(dict(tienda=tienda, fecha=fecha, nota=m.group(1), factura="",
                                        cta=m.group(2), acuenta=False, monto=money(m.group(3)),
                                        texto=concepto, fuente=fuente))
            continue
        for m in PAGO_RE.finditer(concepto):
            if not m.group("forma").startswith("Transfer"):
                continue
            antes = concepto[:m.start()]
            notas = NOTA_RE.findall(antes)
            facts = FACT_RE.findall(antes)
            componentes.append(dict(tienda=tienda, fecha=fecha, nota=notas[-1] if notas else "",
                                    factura=facts[-1] if facts else "", cta=m.group("cta") or "",
                                    acuenta=bool(m.group("acuenta")), monto=money(m.group("monto")),
                                    texto=concepto, fuente=fuente))
    return tienda, dias, componentes, desde, hasta


# --------------------------------------------------------------------------------------
# 2. Lectura del libro SAYER VENTAS
# --------------------------------------------------------------------------------------
def leer_bmex(ws):
    movs = []
    for r in range(1, ws.max_row + 1):
        f, _ = parse_fecha(ws.cell(r, 1).value)
        if not f:
            continue
        dep = num(ws.cell(r, 3).value)
        ret = num(ws.cell(r, 4).value)
        if not dep and not ret:
            continue
        movs.append(dict(row=r, fecha=f, desc=str(ws.cell(r, 2).value or "").strip(),
                         dep=dep or 0.0, ret=ret or 0.0, usado=False))
    return movs


def leer_afiliaciones_encabezado(ws):
    afil = dict(AFILIACIONES)
    for r in range(1, 6):
        for c in range(1, 14):
            v = ws.cell(r, c).value
            if isinstance(v, str):
                m = re.search(r"([A-Za-z ]+?)\s*(\(\d\))?\s+(\d{7})", v)
                if m:
                    t = norm_tienda(m.group(1))
                    if t and not m.group(2):
                        afil[m.group(3)] = t
    return afil


def leer_santander(ws):
    movs = []
    for r in range(1, ws.max_row + 1):
        f, _ = parse_fecha(ws.cell(r, 1).value)
        if not f:
            continue
        concepto = str(ws.cell(r, 3).value or "").strip()
        cargo = num(ws.cell(r, 4).value)
        abono = num(ws.cell(r, 5).value)
        if not cargo and not abono:
            continue
        hora = str(ws.cell(r, 2).value or "")
        m = re.match(r"AFIL\.?-0*(\d{7})", concepto)
        m2 = re.match(r"AFI\s+0*(\d{7})", concepto)
        tipo = "otro"
        afil = None
        if m:
            afil = m.group(1)
            if abono and abono > 0:
                tipo = "abono"
            elif cargo and abs(cargo) in CUOTAS_FIJAS:
                tipo = "cuota"
            elif cargo:
                tipo = "comision"
        elif m2 and cargo:
            afil = m2.group(1)
            tipo = "traspaso"
        movs.append(dict(row=r, fecha=f, hora=hora, concepto=concepto, cargo=abs(cargo) if cargo else 0.0,
                         abono=abono or 0.0, tipo=tipo, afil=afil, usado=False))
    return movs


def leer_ventas_al_dia(ws, desde, hasta):
    """Entradas tienda-día y renglones de depósito a Banamex."""
    entradas = defaultdict(list)   # (tienda, fecha) -> [(monto, row, nota)]
    depositos = []
    margen_ini = desde - dt.timedelta(days=45)
    margen_fin = hasta + dt.timedelta(days=45)
    for r in range(1, ws.max_row + 1):
        a, b, c = ws.cell(r, 1).value, ws.cell(r, 2).value, ws.cell(r, 3).value
        t = norm_tienda(c)
        if t and num(b) is not None:
            f, _ = parse_fecha(a)
            nota = ""
            # solo se corrige un año capturado a futuro (p. ej. 23/09/2027 en septiembre 2026)
            if f and f.year == desde.year + 1 and f > hasta + dt.timedelta(days=180):
                corr = dt.date(desde.year, f.month, f.day)
                if desde <= corr <= hasta and not (desde <= f <= hasta):
                    nota = f"año capturado como {f.year}"
                    f = corr
            if f and desde <= f <= hasta:
                entradas[(t, f)].append((num(b), r, nota))
        # depósitos a la cuenta Banamex
        textos = [str(ws.cell(r, k).value or "") for k in range(1, 8)]
        fila_txt = " ".join(textos).upper()
        if "DEPOSITO" in fila_txt and ("BANAMEX" in fila_txt or "39 444 91" in fila_txt):
            monto = None
            for k in range(1, 8):
                v = ws.cell(r, k).value
                if num(v) is not None and not isinstance(v, str):
                    monto = num(v)
                    break
            partes = [money(x) for x in re.findall(r"\$([\d,]+\.\d{2})", fila_txt)]
            fdep = None
            for rr in range(r, max(r - 4, 0), -1):
                for k in range(1, 8):
                    fd, _ = parse_fecha(ws.cell(rr, k).value)
                    if fd and abs((fd - desde).days) < 400:
                        fdep = fd
                        break
                if fdep:
                    break
            if monto and (fdep is None or margen_ini <= fdep <= margen_fin):
                depositos.append(dict(row=r, fecha=fdep, monto=monto, partes=partes, usado=False))
    return entradas, depositos


def leer_sayer(ws):
    """Pagos a Sayer: cada renglón con J numérico cierra un grupo de facturas."""
    pagos = []
    grupo = []
    for r in range(3, ws.max_row + 1):
        b = num(ws.cell(r, 2).value)
        nc = num(ws.cell(r, 9).value) or 0.0
        k = num(ws.cell(r, 11).value)
        if b is not None and not isinstance(ws.cell(r, 2).value, str):
            # el descuento real es la columna K (1.5% de cada factura; las notas de crédito van en
            # negativo en B y sin descuento). Si K viene vacía en una factura positiva se usa 1.5%.
            if k is None:
                k = round(b * 0.015, 6) if b > 0 else 0.0
            grupo.append((b, nc, r, k))
        j = ws.cell(r, 10).value
        if isinstance(j, (int, float)) and j:
            fpago, _ = parse_fecha(ws.cell(r, 12).value)
            sb = sum(x[0] for x in grupo)
            sn = sum(x[1] for x in grupo)
            sk = sum(x[3] for x in grupo)
            esperado = round(sb - sk - sn, 2)
            pagos.append(dict(row=r, monto=float(j), fecha=fpago, desc=str(ws.cell(r, 15).value or "").strip(),
                              n_fact=len(grupo), suma_fact=round(sb, 2), nc=round(sn, 2), esperado=esperado,
                              filas=(grupo[0][2] if grupo else r, r), usado=False))
            grupo = []
    return pagos


def leer_proveedores(ws):
    filas = []
    for r in range(2, ws.max_row + 1):
        prov = str(ws.cell(r, 3).value or "").strip()
        monto = num(ws.cell(r, 9).value)
        if monto is None:
            monto = num(ws.cell(r, 5).value)
        if not prov or not monto:
            continue
        fpago, _ = parse_fecha(ws.cell(r, 12).value)
        filas.append(dict(row=r, prov=prov, factura=str(ws.cell(r, 4).value or "").strip(),
                          monto=round(monto, 2), forma=str(ws.cell(r, 10).value or "").strip().upper(),
                          fecha=fpago, usado=False))
    return filas


def asegurar_valores(path, avisos):
    """Si el archivo no trae los valores calculados de las fórmulas (p. ej. lo guardó un programa que
    no es Excel), los recalcula con LibreOffice en una copia temporal solo para leerlos."""
    import shutil
    import subprocess
    import tempfile
    wb_f = openpyxl.load_workbook(path, read_only=True)
    wb_v = openpyxl.load_workbook(path, read_only=True, data_only=True)
    total = vacios = 0
    for h in (HOJA_VENTAS, HOJA_SAYER):
        if h not in wb_f.sheetnames:
            continue
        for rf, rv in zip(wb_f[h].iter_rows(values_only=True), wb_v[h].iter_rows(values_only=True)):
            for f, v in zip(rf, rv):
                if isinstance(f, str) and f.startswith("="):
                    total += 1
                    vacios += v is None
    wb_f.close()
    wb_v.close()
    if total == 0 or vacios / total < 0.2:
        return path
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        avisos.append("El archivo no trae valores calculados y no hay LibreOffice para recalcular: "
                      "ábrelo y guárdalo en Excel antes de conciliar.")
        return path
    tmp = tempfile.mkdtemp(prefix="conc_")
    subprocess.run([soffice, "--headless", "--calc", "--convert-to", "xlsx", "--outdir", tmp, path],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=300)
    salida = os.path.join(tmp, os.path.splitext(os.path.basename(path))[0] + ".xlsx")
    if os.path.exists(salida):
        avisos.append(f"El archivo no traía valores calculados ({vacios} de {total} fórmulas); "
                      "se recalcularon con LibreOffice solo para leerlos.")
        print("  Aviso: fórmulas sin valor calculado; se recalcularon con LibreOffice para leerlas.")
        return salida
    return path


# --------------------------------------------------------------------------------------
# 3. Motor de conciliación
# --------------------------------------------------------------------------------------
class Conciliacion:
    def __init__(self, args):
        self.args = args
        self.tol = args.tolerancia
        self.pend = []      # (categoria, fecha, monto, origen, detalle, sugerencia)
        self.control = {}
        self.escrituras = defaultdict(dict)   # hoja -> {(row,col): (valor, color)}
        self.colores = defaultdict(dict)      # hoja -> {(row,col): color}
        self.ya_tenian = 0
        self.escritas = 0
        self.resueltos_a_mano = 0
        self.avisos = []
        self.detalle_bmex = []    # (fila del depósito AFI en Banamex, [(txt_credito, txt_debito), ...])
        self.mapa_bmex = lambda r: r   # fila original -> fila final (cambia si se insertan renglones)

    def pendiente(self, cat, fecha, monto, origen, detalle, sugerencia=""):
        # si el movimiento bancario ya tiene DOCUMENTO capturado a mano, ya está resuelto: no se reporta
        m = re.match(r"(CTA FRIDA \w+) fila (\d+)$", origen)
        if m and not self.args.rehacer:
            cols = (5,) if m.group(1) == HOJA_BMEX else (6, 7, 8, 9)
            for col in cols:
                previo = self.wb_v[m.group(1)].cell(int(m.group(2)), col).value
                if previo not in (None, "") and not str(previo).startswith("PENDIENTE:"):
                    self.resueltos_a_mano += 1
                    return
        self.pend.append((cat, fecha, monto, origen, detalle, sugerencia))

    def escribir(self, hoja, row, col, valor, color=None):
        self.escrituras[hoja][(row, col)] = (valor, color)

    def pintar(self, hoja, row, col, color):
        self.colores[hoja][(row, col)] = color

    def color_celda(self, hoja, r, c):
        """Color de relleno que ya tiene una celda en el archivo original (None si no tiene o es el verde/rojo
        que usa el propio script para detalle y pendientes)."""
        from copy import copy
        try:
            f = self.wb_v[hoja].cell(r, c).fill
            if not f or f.fill_type != "solid":
                return None
            fg = f.fgColor
            if fg.type == "rgb":
                if not isinstance(fg.rgb, str):
                    return None
                hex6 = fg.rgb[-6:].upper()
                if hex6 in ("FFFFFF", "000000", VERDE_DETALLE, ROJO_PEND, AMARILLO_REV, AZUL_TRANSF):
                    return None
                return hex6
            return copy(f)   # color de tema o indexado: se copia tal cual
        except Exception:
            return None

    def en_periodo(self, f):
        return f and self.desde <= f <= self.hasta

    def cerca(self, f, dias):
        return bool(f) and self.desde - dt.timedelta(days=dias) <= f <= self.hasta + dt.timedelta(days=dias)

    # ---------------------------------------------------------------- carga
    def cargar(self):
        a = self.args
        self.dias = {}           # (tienda, fecha) -> dict
        self.comp = []
        rangos = []
        for p in a.resumen:
            tienda, dias, comp, d0, d1 = parse_resumen(p)
            for f, v in dias.items():
                self.dias[(tienda, f)] = v
            self.comp.extend(comp)
            if d0 and d1:
                rangos.append((d0, d1))
            print(f"  Resumen {os.path.basename(p)} -> {tienda}: {len(dias)} días, {len(comp)} transferencias")
        if a.periodo:
            y, m = (int(x) for x in a.periodo.split("-"))
            self.desde = dt.date(y, m, 1)
            self.hasta = (dt.date(y + (m == 12), m % 12 + 1, 1) - dt.timedelta(days=1))
        elif rangos:
            self.desde = min(r[0] for r in rangos)
            self.hasta = max(r[1] for r in rangos)
        else:
            sys.exit("No pude determinar el periodo: usa --periodo AAAA-MM")
        if a.desde:
            self.desde = parse_fecha(a.desde)[0]
        if a.hasta:
            self.hasta = parse_fecha(a.hasta)[0]
        print(f"  Periodo: {fmt(self.desde)} a {fmt(self.hasta)}")

        # dedup de componentes de transferencia (misma nota y monto en varios días/renglones)
        prio = {"venta": 0, "cobranza": 1, "cancelada": 2}
        self.comp.sort(key=lambda c: (prio[c["fuente"]], c["fecha"]))
        vistos = {}
        unicos = []
        for c in self.comp:
            k = (c["tienda"], c["nota"], round(c["monto"], 2), c["acuenta"])
            if c["nota"] and k in vistos:
                vistos[k]["otras_fechas"].append(c["fecha"])
                continue
            c["otras_fechas"] = []
            c["usado"] = False
            vistos[k] = c
            unicos.append(c)
        self.comp = unicos

        print("  Leyendo libro de ventas (puede tardar unos segundos)...")
        self.wb_v = openpyxl.load_workbook(asegurar_valores(a.ventas, self.avisos), data_only=True)
        hojas = self.wb_v.sheetnames
        for h in (HOJA_VENTAS, HOJA_SAYER, HOJA_PROV, HOJA_BMEX, HOJA_SANT):
            if h not in hojas:
                sys.exit(f"No encontré la pestaña '{h}' en {a.ventas}. Pestañas: {hojas}")
        self.afil = leer_afiliaciones_encabezado(self.wb_v[HOJA_SANT])
        self.bmex = leer_bmex(self.wb_v[HOJA_BMEX])
        self.sant = leer_santander(self.wb_v[HOJA_SANT])
        self.entradas, self.dep_vad = leer_ventas_al_dia(self.wb_v[HOJA_VENTAS], self.desde, self.hasta)
        self.sayer = leer_sayer(self.wb_v[HOJA_SAYER])
        self.prov = leer_proveedores(self.wb_v[HOJA_PROV])
        bm = [m for m in self.bmex if self.en_periodo(m["fecha"])]
        sa = [m for m in self.sant if self.en_periodo(m["fecha"])]
        print(f"  Banamex: {len(bm)} movimientos en periodo | Santander: {len(sa)} | "
              f"Depósitos VENTAS AL DIA: {len(self.dep_vad)} | Pagos Sayer: {len(self.sayer)} | Proveedores: {len(self.prov)}")

    # ---------------------------------------------------------------- 1-3 tarjetas
    def tarjetas(self):
        color_i = 0
        abonos = [m for m in self.sant if m["tipo"] == "abono"]
        # 1. abono <-> tienda-día
        dias_usados = set()
        ok1 = 0
        for ab in sorted(abonos, key=lambda x: (x["fecha"], x["row"])):
            tienda = self.afil.get(ab["afil"])
            ab["dia_venta"] = None
            if not tienda:
                if self.en_periodo(ab["fecha"]):
                    nombre = AFILIACIONES_SIN_RESUMEN.get(ab["afil"], "afiliación desconocida")
                    self.pendiente("Santander abono", ab["fecha"], ab["abono"], f"{HOJA_SANT} fila {ab['row']}",
                                   f"Abono afiliación {ab['afil']} ({nombre})", "No hay Resumen de Venta para esta afiliación")
                continue
            mejor = None
            for k in range(0, 8):
                f = ab["fecha"] - dt.timedelta(days=k)
                d = self.dias.get((tienda, f))
                if d and (tienda, f) not in dias_usados and abs(d["debito"] + d["credito"] - ab["abono"]) < 0.01:
                    mejor = f
                    break
            if mejor:
                dias_usados.add((tienda, mejor))
                ab["dia_venta"] = mejor
                ok1 += 1 if self.en_periodo(ab["fecha"]) else 0
            elif self.en_periodo(ab["fecha"]):
                fechas_t = [f for (t, f) in self.dias if t == tienda]
                if fechas_t and ab["fecha"] - dt.timedelta(days=1) < min(fechas_t):
                    sug = "Corresponde a venta de un día anterior a los Resúmenes cargados (mes anterior)"
                else:
                    cerca = [(abs(self.dias[(tienda, f)]["debito"] + self.dias[(tienda, f)]["credito"] - ab["abono"]), f)
                             for f in fechas_t if 0 <= (ab["fecha"] - f).days <= 4 and (tienda, f) not in dias_usados]
                    if cerca:
                        dif, f = min(cerca)
                        tot = self.dias[(tienda, f)]["debito"] + self.dias[(tienda, f)]["credito"]
                        sug = (f"No cuadra con ningún día. Más cercano: venta con tarjeta del {fmt(f)} por "
                               f"{tot:,.2f} (diferencia {ab['abono'] - tot:,.2f})")
                    else:
                        sug = "No encontré un día de venta con T/Débito + T/Crédito igual al abono"
                self.pendiente("Santander abono", ab["fecha"], ab["abono"], f"{HOJA_SANT} fila {ab['row']}",
                               f"{ab['concepto']} ({tienda})", sug)
        # tienda-días con tarjeta sin abono
        for (t, f), d in sorted(self.dias.items(), key=lambda x: (x[0][1], x[0][0])):
            tot = round(d["debito"] + d["credito"], 2)
            if tot > 0 and (t, f) not in dias_usados and self.en_periodo(f):
                ultimo = max((m["fecha"] for m in self.sant), default=None)
                sug = "Aún no se refleja en Santander (fin de mes)" if ultimo and (ultimo - f).days < 3 else \
                    "Venta con tarjeta sin abono en Santander"
                self.pendiente("Venta tarjeta sin abono", f, tot, f"Resumen {t}",
                               f"T/Débito {d['debito']:,.2f} + T/Crédito {d['credito']:,.2f}", sug)
        self.control["Abonos Santander ↔ venta con tarjeta"] = (ok1, len([a for a in abonos if self.en_periodo(a["fecha"])]))

        # 2. traspaso AFI <-> grupo de abonos
        traspasos = [m for m in self.sant if m["tipo"] == "traspaso"]
        libres = defaultdict(list)
        for ab in abonos:
            libres[ab["afil"]].append(ab)
        ok2 = 0
        for tr in sorted(traspasos, key=lambda x: (x["fecha"], x["row"])):
            cands = [a for a in libres[tr["afil"]] if not a.get("grupo") and a["fecha"] <= tr["fecha"]
                     and (tr["fecha"] - a["fecha"]).days <= 10]
            cands.sort(key=lambda a: (a["fecha"], a["row"]))
            encontrado = None
            # preferir abonos del mismo día (1, 2 o 3 abonos)
            por_dia = defaultdict(list)
            for a in cands:
                por_dia[a["fecha"]].append(a)
            for f in sorted(por_dia):
                grupo_dia = por_dia[f]
                for n in range(1, min(3, len(grupo_dia)) + 1):
                    for combo in itertools.combinations(grupo_dia, n):
                        if abs(sum(a["abono"] for a in combo) - tr["cargo"]) < 0.01:
                            encontrado = list(combo)
                            break
                    if encontrado:
                        break
                if encontrado:
                    break
            if not encontrado:
                for n in range(1, 4):
                    for combo in itertools.combinations(cands[:12], n):
                        if abs(sum(a["abono"] for a in combo) - tr["cargo"]) < 0.01:
                            encontrado = list(combo)
                            break
                    if encontrado:
                        break
            if encontrado:
                ok2 += 1 if self.en_periodo(tr["fecha"]) else 0
                color = PALETA_AFI[color_i % len(PALETA_AFI)]
                color_i += 1
                f_ab = max(a["fecha"] for a in encontrado)
                label = etiqueta_afi(tr["afil"], len(encontrado), f_ab)
                tr["grupo"] = dict(label=label, color=color, abonos=encontrado, monto=tr["cargo"])
                for a in encontrado:
                    a["grupo"] = tr["grupo"]
            else:
                # traspaso de abonos que no están en la hoja (p. ej. del mes anterior): se etiqueta con su concepto
                color = PALETA_AFI[color_i % len(PALETA_AFI)]
                color_i += 1
                tr["grupo"] = dict(label=tr["concepto"].upper(), color=color, abonos=[], monto=tr["cargo"],
                                   sin_abonos=True)
                if self.en_periodo(tr["fecha"]):
                    self.pendiente("Santander traspaso", tr["fecha"], tr["cargo"], f"{HOJA_SANT} fila {tr['row']}",
                                   tr["concepto"], "No encontré en la hoja los abonos que suman este traspaso "
                                                   "(¿abonos del mes anterior?). Se ligó a Banamex solo por monto.")
        mas_reciente = max((m["fecha"] for m in self.sant), default=self.hasta)
        for ab in abonos:
            if not ab.get("grupo") and self.en_periodo(ab["fecha"]) and self.afil.get(ab["afil"]):
                sug = ("Traspaso a Banamex probablemente en el mes siguiente" if (mas_reciente - ab["fecha"]).days <= 3
                       else "Aún no se traspasa a Banamex o el traspaso no cuadra")
                self.pendiente("Abono sin traspaso a Banamex", ab["fecha"], ab["abono"], f"{HOJA_SANT} fila {ab['row']}",
                               ab["concepto"], sug)
        self.control["Traspasos AFI Santander ↔ abonos"] = (ok2, len([t for t in traspasos if self.en_periodo(t["fecha"])]))

        # comisiones -> abono (mismo día, misma afiliación, misma hora; la más cercana a ~0.7%)
        comisiones = [m for m in self.sant if m["tipo"] == "comision"]
        for cm in comisiones:
            cands = [a for a in abonos if a["afil"] == cm["afil"] and a["fecha"] == cm["fecha"]]
            mismos = [a for a in cands if a["hora"] == cm["hora"]] or cands
            if not mismos:
                continue
            # cada abono tiene comisión (~0.7%) + IVA (~0.112%)
            best = min(mismos, key=lambda a: min(abs(cm["cargo"] - a["abono"] * 0.007),
                                                  abs(cm["cargo"] - a["abono"] * 0.00112)))
            cm["abono_ref"] = best

        # 3. Banamex depósito <-> traspaso AFI
        ok3 = 0
        for tr in sorted([t for t in traspasos if t.get("grupo")], key=lambda x: (x["fecha"], x["row"])):
            cands = [m for m in self.bmex if not m["usado"] and m["dep"] and abs(m["dep"] - tr["cargo"]) < 0.01
                     and 0 <= (m["fecha"] - tr["fecha"]).days <= 5]
            cands.sort(key=lambda m: ((m["fecha"] - tr["fecha"]).days, m["row"]))
            if cands:
                m = cands[0]
                m["usado"] = True
                m["tipo"] = "afi"
                tr["bmex"] = m
                ok3 += 1 if self.en_periodo(tr["fecha"]) else 0
            elif self.en_periodo(tr["fecha"]):
                self.pendiente("Traspaso AFI sin depósito en Banamex", tr["fecha"], tr["cargo"],
                               f"{HOJA_SANT} fila {tr['row']}", tr["grupo"]["label"],
                               "No aparece en Banamex con el mismo monto (0-5 días después)")
        self.control["Depósitos AFI Banamex ↔ traspasos Santander"] = (ok3, len([t for t in traspasos if t.get("grupo") and self.en_periodo(t["fecha"])]))

        # --- color de cada grupo: si Max ya le dio color (en H/I/E del abono, F del traspaso, G de las
        # comisiones o E del depósito en Banamex) se reutiliza, para que E y H coincidan uno a uno
        comis_por_abono = defaultdict(list)
        for cm in comisiones:
            if cm.get("abono_ref"):
                comis_por_abono[id(cm["abono_ref"])].append(cm)
        for tr in traspasos:
            g = tr.get("grupo")
            if not g or g.get("color_fijo"):
                continue
            celdas = []
            if g["abonos"]:
                ultimo = max(g["abonos"], key=lambda a: a["row"])
                celdas += [(HOJA_SANT, ultimo["row"], 8), (HOJA_SANT, ultimo["row"], 9)]
                celdas += [(HOJA_SANT, a["row"], 5) for a in g["abonos"]]
                celdas += [(HOJA_SANT, cm["row"], 7) for a in g["abonos"] for cm in comis_por_abono[id(a)]]
            celdas.append((HOJA_SANT, tr["row"], 6))
            if tr.get("bmex"):
                celdas.append((HOJA_BMEX, tr["bmex"]["row"], 5))
            for hoja, r, c in celdas:
                existente = self.color_celda(hoja, r, c)
                if existente:
                    g["color"] = existente
                    break
            g["color_fijo"] = True

        # --- escrituras Santander y Banamex
        for ab in abonos:
            g = ab.get("grupo")
            d = self.dias.get((self.afil.get(ab["afil"]), ab["dia_venta"])) if ab.get("dia_venta") else None
            if not self.en_periodo(ab["fecha"]):
                # abono del mes anterior cuyo traspaso cae en este periodo: solo completar H/I si están vacías
                tr_g = [t for t in traspasos if t.get("grupo") is g and self.en_periodo(t["fecha"])] if g else []
                if tr_g and ab is max(g["abonos"], key=lambda a: a["row"]):
                    self.escribir(HOJA_SANT, ab["row"], 8, g["monto"], g["color"])
                    self.escribir(HOJA_SANT, ab["row"], 9, g["label"], g["color"])
                continue
            if d:
                if d["txt_credito"]:
                    self.escribir(HOJA_SANT, ab["row"], 6, d["txt_credito"], VERDE_DETALLE)
                if d["txt_debito"]:
                    self.escribir(HOJA_SANT, ab["row"], 7, d["txt_debito"], VERDE_DETALLE)
            if g:
                # la suma (H) y la etiqueta (I) van una sola vez por traspaso: en el último abono del grupo
                if ab is max(g["abonos"], key=lambda a: a["row"]):
                    self.escribir(HOJA_SANT, ab["row"], 8, g["monto"], g["color"])
                    self.escribir(HOJA_SANT, ab["row"], 9, g["label"], g["color"])
                self.pintar(HOJA_SANT, ab["row"], 5, g["color"])
        for cm in comisiones:
            ab = cm.get("abono_ref")
            if ab and self.en_periodo(cm["fecha"]):
                self.escribir(HOJA_SANT, cm["row"], 6, "COMISION DE")
                color = ab["grupo"]["color"] if ab.get("grupo") else None
                self.escribir(HOJA_SANT, cm["row"], 7, ab["abono"], color)
        for tr in traspasos:
            g = tr.get("grupo")
            if g and self.en_periodo(tr["fecha"]):
                self.escribir(HOJA_SANT, tr["row"], 6, g["label"], g["color"])
            m = tr.get("bmex")
            if g and m and self.en_periodo(m["fecha"]):
                self.escribir(HOJA_BMEX, m["row"], 5, g["label"], g["color"])
                # un renglón de detalle por abono (día de venta): E = notas con T/Crédito, F = notas con T/Débito
                detalle = []
                for a in sorted(g["abonos"], key=lambda a: (a["fecha"], a["row"])):
                    d = self.dias.get((self.afil.get(a["afil"]), a.get("dia_venta")), {})
                    if d.get("txt_credito") or d.get("txt_debito"):
                        detalle.append((d.get("txt_credito", ""), d.get("txt_debito", "")))
                if detalle:
                    self.detalle_bmex.append((m["row"], detalle))

    # ---------------------------------------------------------------- 5-6 efectivo
    def efectivo(self):
        es_efectivo = re.compile(r"EFECTIV|ABONO POR COBRANZA|VENTASMOSTRADOR", re.I)
        cash = [m for m in self.bmex if not m["usado"] and m["dep"] and es_efectivo.search(sin_acentos(m["desc"]))]
        for m in cash:
            m["tipo"] = "efectivo"
        ok = 0
        total = len([m for m in cash if self.en_periodo(m["fecha"])])
        for dep in sorted(self.dep_vad, key=lambda d: (d["fecha"] or self.desde, d["row"])):
            libres = [m for m in cash if not m["usado"] and
                      (dep["fecha"] is None or -2 <= (m["fecha"] - dep["fecha"]).days <= 6)]
            match = None
            for m in libres:
                if abs(m["dep"] - dep["monto"]) <= 0.5:
                    match = [m]
                    break
            if not match:
                for a, b in itertools.combinations(libres, 2):
                    if abs(a["dep"] + b["dep"] - dep["monto"]) <= 0.5:
                        match = [a, b]
                        break
            if match:
                for m in match:
                    m["usado"] = True
                    m["vad"] = dep
                    ok += 1 if self.en_periodo(m["fecha"]) else 0
                dep["usado"] = True
        for m in cash:
            if not self.en_periodo(m["fecha"]):
                continue
            if m.get("vad"):
                self.escribir(HOJA_BMEX, m["row"], 5, "VENTAS MOSTRADOR", AZUL_TRANSF)
            else:
                self.pendiente("Depósito de efectivo", m["fecha"], m["dep"], f"{HOJA_BMEX} fila {m['row']}",
                               m["desc"], "No encontré el renglón de depósito en VENTAS AL DIA con ese monto")
        for dep in self.dep_vad:
            if not dep["usado"] and dep["fecha"] and self.en_periodo(dep["fecha"]):
                self.pendiente("Depósito VENTAS AL DIA sin reflejo", dep["fecha"], dep["monto"],
                               f"{HOJA_VENTAS} fila {dep['row']}", "Renglón DEPOSITO ... BANAMEX",
                               "No aparece en Banamex como depósito de efectivo")
        self.control["Depósitos de efectivo Banamex ↔ VENTAS AL DIA"] = (ok, total)

        # 6. entradas tienda-día vs Efectivo a Entregar
        self.tabla_efectivo = []
        okd = 0
        n = 0
        claves = set(k for k in self.dias if self.en_periodo(k[1]) and k[0] in TIENDAS) | set(self.entradas)
        for (t, f) in sorted(claves, key=lambda k: (k[0], k[1])):
            d = self.dias.get((t, f))
            ef = d["efectivo"] if d else None
            ent = self.entradas.get((t, f), [])
            reg = sum(e[0] for e in ent) if ent else None
            filas = ", ".join(str(e[1]) for e in ent)
            notas = "; ".join(e[2] for e in ent if e[2])
            if ef is None and reg is None:
                continue
            if (ef or 0) == 0 and reg is None:
                continue
            n += 1
            if ef is None:
                est, dif = "Sin resumen", None
            elif reg is None:
                est, dif = "Sin registro en VENTAS AL DIA", None
            else:
                dif = round(reg - ef, 2)
                est = "OK" if abs(dif) <= self.tol else "Revisar"
            if est == "OK":
                okd += 1
            self.tabla_efectivo.append([t, f, ef, reg, dif, est, filas, notas])
        # detectar días intercambiados (diferencias opuestas en la misma tienda, ±4 días)
        revisar = [x for x in self.tabla_efectivo if x[5] == "Revisar"]
        for a, b in itertools.combinations(revisar, 2):
            if a[0] == b[0] and abs((a[1] - b[1]).days) <= 4 and abs(a[4] + b[4]) <= self.tol:
                a[7] = (a[7] + "; " if a[7] else "") + f"Posible captura intercambiada con el {fmt(b[1])}"
                b[7] = (b[7] + "; " if b[7] else "") + f"Posible captura intercambiada con el {fmt(a[1])}"
        for t, f, ef, reg, dif, est, filas, notas in self.tabla_efectivo:
            if est != "OK":
                self.pendiente("Efectivo tienda-día", f, dif if dif is not None else (ef or reg),
                               f"{HOJA_VENTAS} fila(s) {filas}" if filas else f"Resumen {t}",
                               f"{t}: Efectivo a Entregar {ef if ef is not None else '-'} vs VENTAS AL DIA {reg if reg is not None else '-'}",
                               est + (f" ({notas})" if notas else ""))
            elif notas:
                self.pendiente("Efectivo tienda-día", f, reg, f"{HOJA_VENTAS} fila(s) {filas}", t, notas)
        self.control[f"Efectivo tienda-día (tolerancia ±${self.tol:g})"] = (okd, n)

    # ---------------------------------------------------------------- 4 transferencias de clientes
    def transferencias(self):
        deps = [m for m in self.bmex if not m["usado"] and m["dep"] and self.cerca(m["fecha"], 30)]
        for m in deps:
            m["tipo"] = "transfer"
        ventana = (-15, 10)   # días banco - fecha de venta (hay clientes que pagan antes de la nota)

        def libres(fuente=None):
            return [c for c in self.comp if not c["usado"] and (fuente is None or c["fuente"] == fuente)]

        def en_ventana(m, c):
            d = (m["fecha"] - c["fecha"]).days
            return ventana[0] <= d <= ventana[1]

        def asignar(m, comps, obs=""):
            m["usado"] = True
            m["comps"] = comps
            m["obs"] = obs
            for c in comps:
                c["usado"] = True
                c["bmex"] = m

        # paso 1: monto exacto, fuente venta. Si un mismo monto se repite, se busca la asignación con
        # menor suma de días de diferencia y, en empate, la que respeta el orden cronológico.
        idx_c = defaultdict(list)
        for c in libres("venta"):
            idx_c[round(c["monto"], 2)].append(c)
        idx_m = defaultdict(list)
        for m in deps:
            idx_m[round(m["dep"], 2)].append(m)
        for monto, ms in idx_m.items():
            cs = idx_c.get(monto, [])
            if not cs:
                continue
            ms = sorted(ms, key=lambda m: (m["fecha"], m["row"]))
            cs = sorted(cs, key=lambda c: c["fecha"])
            if len(ms) * len(cs) == 1 or len(ms) > 6 or len(cs) > 6:
                pares = sorted(((abs((m["fecha"] - c["fecha"]).days), m["row"], i, j)
                                for i, m in enumerate(ms) for j, c in enumerate(cs) if en_ventana(m, c)))
                um, uc = set(), set()
                for _, _, i, j in pares:
                    if i not in um and j not in uc:
                        um.add(i)
                        uc.add(j)
                        asignar(ms[i], [cs[j]])
                continue
            mejor = None
            for k in range(min(len(ms), len(cs)), 0, -1):
                for sub_m in itertools.combinations(range(len(ms)), k):
                    for perm in itertools.permutations(range(len(cs)), k):
                        pares = list(zip(sub_m, perm))
                        if not all(en_ventana(ms[i], cs[j]) for i, j in pares):
                            continue
                        costo = sum(abs((ms[i]["fecha"] - cs[j]["fecha"]).days) for i, j in pares)
                        inversiones = sum(1 for (a, b), (c2, d2) in itertools.combinations(pares, 2)
                                          if (a - c2) * (b - d2) < 0)
                        clave = (costo, inversiones)
                        if mejor is None or clave < mejor[0]:
                            mejor = (clave, pares)
                if mejor:
                    break
            if mejor:
                for i, j in mejor[1]:
                    asignar(ms[i], [cs[j]])
        # paso 2: un depósito = varias notas/pagos (misma nota o mismo cliente-cuenta)
        for m in [d for d in deps if not d["usado"]]:
            cands = [c for c in libres("venta") if en_ventana(m, c) and c["monto"] < m["dep"] + EPS]
            grupos = defaultdict(list)
            for c in cands:
                grupos[("n", c["tienda"], c["nota"])].append(c)
                if c["cta"]:
                    grupos[("c", c["tienda"], c["cta"])].append(c)
            hecho = False
            for g in grupos.values():
                if len(g) < 2:
                    continue
                for n in range(2, min(4, len(g)) + 1):
                    for combo in itertools.combinations(g[:10], n):
                        if abs(sum(c["monto"] for c in combo) - m["dep"]) < 0.011:
                            asignar(m, list(combo), "Un depósito cubre varios pagos")
                            hecho = True
                            break
                    if hecho:
                        break
                if hecho:
                    break
        # paso 2b: monto exacto + el nombre del cliente aparece en la descripción del banco (ventana amplia)
        def tokens(s):
            return {w for w in re.findall(r"[A-Z]{3,}", sin_acentos(s).upper())
                    if w not in {"PAGO", "RECIBIDO", "DEPOSITO", "INTERBANCARIO", "AUT", "FACTURA", "NOTA",
                                 "TRANSFERENCIA", "MOSTRADOR", "CUENTA"}}
        for m in [d for d in deps if not d["usado"]]:
            tb = tokens(m["desc"])
            if len(tb) < 2:
                continue
            cands = []
            for c in libres("venta"):
                if abs(c["monto"] - m["dep"]) < EPS and abs((m["fecha"] - c["fecha"]).days) <= 45:
                    cliente = c["texto"].split(" - ")[0]
                    if len(tb & tokens(cliente)) >= 2:
                        cands.append(c)
            if cands:
                cands.sort(key=lambda c: abs((m["fecha"] - c["fecha"]).days))
                asignar(m, [cands[0]], "Pago con fecha alejada de la nota (mismo cliente y monto)")
        # paso 3: notas de COBRANZA / CANCELADAS (monto exacto) -> con observación
        for fuente, obs in (("cobranza", "Pago registrado como COBRANZA"),
                            ("cancelada", "Coincide con una nota CANCELADA: revisar refactura")):
            for m in [d for d in deps if not d["usado"]]:
                cands = [c for c in libres(fuente) if abs(c["monto"] - m["dep"]) < EPS and en_ventana(m, c)]
                cands.sort(key=lambda c: abs((m["fecha"] - c["fecha"]).days))
                if cands:
                    asignar(m, [cands[0]], obs)
        # escrituras y pendientes
        ok = 0
        tot = 0
        for m in deps:
            if not self.en_periodo(m["fecha"]):
                continue
            tot += 1
            if m["usado"]:
                ok += 1
                texto = " | ".join(dict.fromkeys(c["texto"] for c in m["comps"]))
                color = AZUL_TRANSF if not m["obs"] or m["obs"].startswith("Un dep") else AMARILLO_REV
                self.escribir(HOJA_BMEX, m["row"], 5, texto, color)
                if m["obs"] and color == AMARILLO_REV:
                    c = m["comps"][0]
                    self.pendiente("Transferencia con observación", m["fecha"], m["dep"], f"{HOJA_BMEX} fila {m['row']}",
                                   f"{c['tienda']} {fmt(c['fecha'])} Nota {c['nota']}", m["obs"])
            else:
                sug = "Puede ser cobranza de crédito, pago anticipado o de otro mes"
                self.pendiente("Depósito sin identificar", m["fecha"], m["dep"], f"{HOJA_BMEX} fila {m['row']}",
                               m["desc"], sug)
        for c in self.comp:
            if c["fuente"] == "venta" and not c["usado"] and self.en_periodo(c["fecha"]):
                self.pendiente("Transferencia de venta sin depósito", c["fecha"], c["monto"],
                               f"Resumen {c['tienda']}", c["texto"][:250],
                               "No encontré el depósito en Banamex (-15 a +10 días de la nota)")
        self.control["Transferencias de clientes Banamex ↔ Resúmenes"] = (ok, tot)

    # ---------------------------------------------------------------- 7-8 pagos
    def pagos(self):
        rets = [m for m in self.bmex if not m["usado"] and m["ret"] and self.cerca(m["fecha"], 15)]
        # Sayer
        ok = tot = 0
        for p in self.sayer:
            if not (p["fecha"] and self.en_periodo(p["fecha"])):
                continue
            tot += 1
            dif = round(p["monto"] - p["esperado"], 2)
            p["dif"] = dif
            if abs(dif) > 0.05:
                self.pendiente("Pago Sayer: cálculo", p["fecha"], p["monto"], f"{HOJA_SAYER} filas {p['filas'][0]}-{p['filas'][1]}",
                               f"{p['desc']} | facturas {p['suma_fact']:,.2f} − descuento (K) − NC (I) {p['nc']:,.2f} = {p['esperado']:,.2f}",
                               f"Diferencia {dif:,.2f}")
            cands = [m for m in rets if not m["usado"] and abs(m["ret"] - p["monto"]) < 0.01
                     and -3 <= (m["fecha"] - p["fecha"]).days <= 5]
            cands.sort(key=lambda m: (abs((m["fecha"] - p["fecha"]).days), m["row"]))
            if cands:
                m = cands[0]
                m["usado"] = True
                m["tipo"] = "sayer"
                p["bmex"] = m
                ok += 1
                if self.en_periodo(m["fecha"]):
                    self.escribir(HOJA_BMEX, m["row"], 5, p["desc"] or f"SAYER PAGO DE {p['n_fact']} FACTURAS")
            else:
                self.pendiente("Pago Sayer sin cargo en Banamex", p["fecha"], p["monto"], f"{HOJA_SAYER} fila {p['row']}",
                               p["desc"], "No aparece el cargo en Banamex (-3 a +5 días)")
        self.control["Pagos a Sayer ↔ Banamex"] = (ok, tot)

        # Proveedores (solo transferencias)
        # solo facturas con fecha de pago cercana al periodo (o fecha mal capturada en los últimos renglones)
        ultima_fila = max((p["row"] for p in self.prov), default=0)
        provs = [p for p in self.prov if ("TRANSFER" in p["forma"] or not p["forma"]) and (
            self.cerca(p["fecha"], 20) or
            (p["row"] > ultima_fila - 150 and (p["fecha"] is None or abs(p["fecha"].year - self.desde.year) > 1)))]
        okp = 0
        grupos = defaultdict(list)
        for p in provs:
            grupos[(sin_acentos(p["prov"]).upper(), p["fecha"])].append(p)

        def etiqueta(ps):
            facts = [re.sub(r"^F-", "", x["factura"]) for x in ps if x["factura"]]
            pref = "F-" if ps[0]["factura"].startswith("F-") else ""
            return f"{ps[0]['prov']} {pref}{', '.join(facts)}".strip()

        def asignar(m, ps):
            m["usado"] = True
            m["tipo"] = "proveedor"
            for p in ps:
                p["usado"] = True
            if self.en_periodo(m["fecha"]):
                self.escribir(HOJA_BMEX, m["row"], 5, etiqueta(ps))

        # a) grupo proveedor+fecha de pago = un cargo
        for (prov, f), ps in grupos.items():
            total = round(sum(p["monto"] for p in ps), 2)
            cands = [m for m in rets if not m["usado"] and abs(m["ret"] - total) < 0.01 and
                     (f is None or -5 <= (m["fecha"] - f).days <= 5)]
            if cands:
                asignar(sorted(cands, key=lambda m: abs((m["fecha"] - f).days) if f else 0)[0], ps)
        # b) facturas sueltas o subconjuntos del mismo proveedor
        for m in [r for r in rets if not r["usado"]]:
            libres_p = [p for p in provs if not p["usado"]]
            por_prov = defaultdict(list)
            for p in libres_p:
                por_prov[sin_acentos(p["prov"]).upper()].append(p)
            hecho = False
            for ps in por_prov.values():
                for n in range(1, min(7, len(ps)) + 1):
                    for combo in itertools.combinations(ps[:14], n):
                        if abs(sum(p["monto"] for p in combo) - m["ret"]) < 0.01:
                            asignar(m, list(combo))
                            hecho = True
                            break
                    if hecho:
                        break
                if hecho:
                    break
        for p in provs:
            if p["usado"]:
                okp += 1
            elif "TRANSFER" in p["forma"] and (self.en_periodo(p["fecha"]) or p["fecha"] is None
                                                or abs(p["fecha"].year - self.desde.year) > 1):
                self.pendiente("Proveedor (transferencia) sin cargo", p["fecha"], p["monto"], f"{HOJA_PROV} fila {p['row']}",
                               f"{p['prov']} {p['factura']}", "No encontré el cargo en Banamex")
        self.control["Pagos a proveedores (transferencia) ↔ Banamex"] = (
            okp, len([p for p in provs if p["usado"] or "TRANSFER" in p["forma"]]))
        # retiros restantes
        for m in rets:
            if not m["usado"] and self.en_periodo(m["fecha"]):
                self.pendiente("Cargo sin identificar", m["fecha"], m["ret"], f"{HOJA_BMEX} fila {m['row']}", m["desc"],
                               "No está en SAYER FRIDA PAGOS ni en PROVEDORES (transferencia)")

    # ---------------------------------------------------------------- salida
    def guardar(self):
        a = self.args
        print("  Escribiendo copia del archivo...")
        wb = openpyxl.load_workbook(a.ventas)
        escritas = 0
        if a.rehacer:
            # borrar columnas DOCUMENTO de los renglones del periodo antes de llenar
            for hoja, cols in ((HOJA_BMEX, (5, 6, 7)), (HOJA_SANT, (6, 7, 8, 9))):
                ws = wb[hoja]
                for r in range(1, ws.max_row + 1):
                    f, _ = parse_fecha(ws.cell(r, 1).value)
                    if f and self.en_periodo(f):
                        for c in cols:
                            ws.cell(r, c).value = None
                            ws.cell(r, c).fill = PatternFill()
        for hoja, celdas in self.escrituras.items():
            ws = wb[hoja]
            for (r, c), (valor, color) in celdas.items():
                cell = ws.cell(r, c)
                previo = cell.value
                es_marca = isinstance(previo, str) and previo.startswith("PENDIENTE:")
                if previo not in (None, "") and not es_marca and not a.sobrescribir:
                    self.ya_tenian += 1
                    # revisar que la etiqueta AFI capturada a mano sea de la misma afiliación que la calculada
                    ma = re.search(r"AFI\s+0*(\d{7})", str(previo))
                    mb = re.search(r"AFI\s+0*(\d{7})", str(valor))
                    if ma and mb and ma.group(1) != mb.group(1) and c in (5, 9):
                        hoja_v = self.wb_v[hoja]
                        f_mov, _ = parse_fecha(hoja_v.cell(r, 1).value)
                        monto = num(hoja_v.cell(r, 3 if hoja == HOJA_BMEX else 5).value)
                        self.pend.append(("Etiqueta AFI no coincide", f_mov, monto, f"{hoja} fila {r}",
                                          f"Capturado: {previo}", f"Según Santander corresponde a: {valor}"))
                    continue
                cell.value = valor
                if color:
                    cell.fill = fill(color)
                escritas += 1
        for hoja, celdas in self.colores.items():
            ws = wb[hoja]
            for (r, c), color in celdas.items():
                ws.cell(r, c).fill = fill(color)
        # marcar en rojo los movimientos bancarios pendientes
        for cat, f, monto, origen, det, sug in self.pend:
            m = re.match(r"(CTA FRIDA \w+) fila (\d+)$", origen)
            if m and cat not in ("Transferencia con observación",):
                hoja, r = m.group(1), int(m.group(2))
                col = 5 if hoja == HOJA_BMEX else 6
                cell = wb[hoja].cell(r, col)
                if cell.value in (None, ""):
                    cell.value = "PENDIENTE: " + sug
                    cell.fill = fill(ROJO_PEND)

        self.escritas = escritas
        self._insertar_detalle_bmex(wb)
        sufijo = f"{MESES_CORTO[self.desde.month - 1]}-{str(self.desde.year)[2:]}"
        for nombre in (f"PENDIENTES {sufijo}", f"CONTROL {sufijo}"):
            if nombre in wb.sheetnames:
                del wb[nombre]
        self._hoja_pendientes(wb.create_sheet(f"PENDIENTES {sufijo}"))
        self._hoja_control(wb.create_sheet(f"CONTROL {sufijo}"))
        wb.save(a.salida)
        print(f"  Guardado: {a.salida}")

    def _insertar_detalle_bmex(self, wb):
        """Inserta 1-2 renglones debajo de cada depósito AFI en Banamex con el detalle de notas con tarjeta
        (como lo hace Max a mano) y corrige las referencias de todas las fórmulas que apuntan a esa hoja."""
        from copy import copy
        ws = wb[HOJA_BMEX]
        plan = []   # (fila original del depósito, filas a insertar, detalle)
        for fila, detalle in self.detalle_bmex:
            # ¿ya tiene renglones de detalle debajo (capturados a mano o de una corrida anterior)?
            r = fila + 1
            existentes = 0
            while (ws.cell(r, 1).value in (None, "") and ws.cell(r, 3).value in (None, "")
                   and ws.cell(r, 4).value in (None, "")
                   and any(ws.cell(r, c).value not in (None, "") for c in (5, 6))):
                existentes += 1
                r += 1
            if existentes:
                self.ya_tenian += 1
                continue
            plan.append((fila, len(detalle), detalle))
        if not plan:
            return
        plan.sort()
        inserciones = [(fila + 1, k) for fila, k, _ in plan]   # insertar antes de la fila original fila+1

        def mapa(r):
            return r + sum(k for pos, k in inserciones if r >= pos)
        self.mapa_bmex = mapa

        alturas = {r: d.height for r, d in ws.row_dimensions.items() if d.height is not None}
        for pos, k in sorted(inserciones, reverse=True):
            ws.insert_rows(pos, k)
        # alturas de fila
        for r in list(ws.row_dimensions.keys()):
            ws.row_dimensions[r].height = None
        for r, h in alturas.items():
            ws.row_dimensions[mapa(r)].height = h
        # fórmulas de todo el libro que apuntan a esta hoja
        self._corregir_formulas(wb, HOJA_BMEX, mapa)
        # escribir el detalle
        for fila, k, detalle in plan:
            base = mapa(fila)
            for i, (txt_c, txt_d) in enumerate(detalle, 1):
                r = base + i
                for c in range(1, 8):
                    ws.cell(r, c)._style = copy(ws.cell(base, c)._style)
                ws.cell(r, 5).value = txt_c or None
                ws.cell(r, 6).value = txt_d or None
                for c in (5, 6):
                    ws.cell(r, c).fill = fill(VERDE_DETALLE)
                    ws.cell(r, c).alignment = Alignment(wrap_text=False)
                self.escritas += 1
        self.filas_insertadas = sum(k for _, k, _ in plan)
        print(f"  Banamex: se insertaron {self.filas_insertadas} renglones de detalle debajo de "
              f"{len(plan)} depósitos AFI (fórmulas ajustadas)")

    @staticmethod
    def _corregir_formulas(wb, hoja_obj, mapa):
        from openpyxl.formula.tokenizer import Tokenizer
        ref_re = re.compile(r"^(?:(?P<hoja>'[^']+'|[^'!:]+)!)?(?P<a>\$?[A-Z]{1,3}\$?\d+|\$?\d+)"
                            r"(?::(?P<b>\$?[A-Z]{1,3}\$?\d+|\$?\d+))?$")
        cel_re = re.compile(r"^(\$?[A-Z]{0,3}\$?)(\d+)$")

        def mover(ref):
            m = cel_re.match(ref)
            if not m:
                return ref
            return m.group(1) + str(mapa(int(m.group(2))))

        for ws in wb.worksheets:
            misma = ws.title == hoja_obj
            for row in ws.iter_rows():
                for cell in row:
                    v = cell.value
                    if not (isinstance(v, str) and v.startswith("=")):
                        continue
                    if not misma and hoja_obj.upper() not in v.upper():
                        continue
                    try:
                        tok = Tokenizer(v)
                    except Exception:
                        continue
                    cambio = False
                    for t in tok.items:
                        if t.type != "OPERAND" or t.subtype != "RANGE":
                            continue
                        m = ref_re.match(t.value)
                        if not m:
                            continue
                        h = m.group("hoja")
                        destino = h.strip("'") if h else ws.title
                        if destino.upper() != hoja_obj.upper():
                            continue
                        nuevo = (h + "!" if h else "") + mover(m.group("a"))
                        if m.group("b"):
                            nuevo += ":" + mover(m.group("b"))
                        if nuevo != t.value:
                            t.value = nuevo
                            cambio = True
                    if cambio:
                        cell.value = tok.render()

    def _encabezado(self, ws, fila, titulos, anchos=None):
        for i, t in enumerate(titulos, 1):
            c = ws.cell(fila, i, t)
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = fill("1F4E78")
            c.alignment = Alignment(vertical="center", wrap_text=True)
        if anchos:
            for i, w in enumerate(anchos, 1):
                ws.column_dimensions[get_column_letter(i)].width = w

    def _hoja_pendientes(self, ws):
        ws["A1"] = f"PENDIENTES DE CONCILIACIÓN — {fmt(self.desde)} a {fmt(self.hasta)}"
        ws["A1"].font = Font(bold=True, size=14)
        ws["A2"] = "Lo que el proceso automático no pudo cruzar. Revisar y resolver manualmente."
        self._encabezado(ws, 4, ["Categoría", "Fecha", "Monto", "Dónde", "Detalle", "Sugerencia / motivo", "Revisado"],
                         [30, 12, 14, 30, 80, 55, 10])
        orden = sorted(self.pend, key=lambda p: (p[0], p[1] or dt.date(1900, 1, 1)))
        for i, (cat, f, monto, origen, det, sug) in enumerate(orden, 5):
            mb = re.match(rf"({HOJA_BMEX}) fila (\d+)$", origen)
            if mb:
                origen = f"{HOJA_BMEX} fila {self.mapa_bmex(int(mb.group(2)))}"
            ws.cell(i, 1, cat)
            c = ws.cell(i, 2, f)
            c.number_format = "DD/MM/YYYY"
            c = ws.cell(i, 3, monto)
            c.number_format = '#,##0.00'
            ws.cell(i, 4, origen)
            ws.cell(i, 5, str(det)[:500])
            ws.cell(i, 6, sug)
        ws.freeze_panes = "A5"
        ws.auto_filter.ref = f"A4:G{max(5, 4 + len(orden))}"

    def _hoja_control(self, ws):
        ws["A1"] = f"CONTROL DE CONCILIACIÓN — {fmt(self.desde)} a {fmt(self.hasta)}"
        ws["A1"].font = Font(bold=True, size=14)
        ws["A2"] = f"Generado {dt.datetime.now():%d/%m/%Y %H:%M}. Celdas llenadas: {self.escritas}. " \
                   f"Celdas que ya tenían contenido y no se tocaron: {self.ya_tenian}. " \
                   f"Movimientos sin cruce automático pero ya documentados a mano (no se listan): {self.resueltos_a_mano}."
        self._encabezado(ws, 4, ["Cruce", "Conciliados", "Total", "%"], [52, 13, 13, 10])
        r = 5
        for k, (ok, tot) in self.control.items():
            ws.cell(r, 1, k)
            ws.cell(r, 2, ok)
            ws.cell(r, 3, tot)
            c = ws.cell(r, 4, (ok / tot) if tot else None)
            c.number_format = "0%"
            r += 1
        r += 2
        ws.cell(r, 1, "EFECTIVO POR TIENDA-DÍA (Resumen 'Efectivo a Entregar' vs VENTAS AL DIA)").font = Font(bold=True)
        r += 1
        self._encabezado(ws, r, ["Tienda", "Fecha", "Efectivo a Entregar", "VENTAS AL DIA", "Diferencia",
                                 "Estatus", "Fila(s)", "Nota"])
        for col, w in zip("EFGH", (13, 28, 14, 30)):
            ws.column_dimensions[col].width = w
        r += 1
        for t, f, ef, reg, dif, est, filas, notas in self.tabla_efectivo:
            vals = [t, f, ef, reg, dif, est, filas, notas]
            for i, v in enumerate(vals, 1):
                c = ws.cell(r, i, v)
                if i == 2:
                    c.number_format = "DD/MM/YYYY"
                if i in (3, 4, 5):
                    c.number_format = '#,##0.00'
            if est != "OK":
                for i in range(1, 9):
                    ws.cell(r, i).fill = fill(ROJO_PEND)
            r += 1
        r += 2
        ws.cell(r, 1, "PAGOS A SAYER (J = Σ facturas (B) − Σ descuento 1.5% (K) − notas de crédito (I))").font = Font(bold=True)
        r += 1
        self._encabezado(ws, r, ["Descripción", "Fecha pago", "Facturas", "Suma facturas", "Esperado",
                                 "Pagado (J)", "Diferencia", "Fila Banamex"])
        r += 1
        for p in self.sayer:
            if not (p["fecha"] and self.en_periodo(p["fecha"])):
                continue
            vals = [p["desc"], p["fecha"], p["n_fact"], p["suma_fact"], p["esperado"], p["monto"],
                    p.get("dif"), self.mapa_bmex(p["bmex"]["row"]) if p.get("bmex") else "SIN CARGO"]
            for i, v in enumerate(vals, 1):
                c = ws.cell(r, i, v)
                if i == 2:
                    c.number_format = "DD/MM/YYYY"
                if i in (4, 5, 6, 7):
                    c.number_format = '#,##0.00'
            r += 1
        r += 2
        ws.cell(r, 1, "Colores: azul = transferencia de cliente conciliada; verde = detalle de notas con tarjeta; "
                      "mismo color en Santander y Banamex = mismo traspaso AFI; amarillo = conciliado con observación; "
                      "rojo = pendiente.")

    def correr(self):
        print("Conciliación SayerPro")
        self.cargar()
        self.tarjetas()
        self.efectivo()
        self.transferencias()
        self.pagos()
        self.guardar()
        print("\nRESUMEN")
        for k, (ok, tot) in self.control.items():
            print(f"  {k}: {ok}/{tot}")
        print(f"  Pendientes para revisión: {len(self.pend)} (ya documentados a mano y omitidos: {self.resueltos_a_mano})")
        print(f"  Celdas llenadas: {self.escritas} | ya tenían contenido (no se tocaron): {self.ya_tenian}")


def main():
    ap = argparse.ArgumentParser(description="Conciliación mensual SayerPro Soluciones")
    ap.add_argument("--ventas", required=True, help="Libro SAYER VENTAS (.xlsx)")
    ap.add_argument("--resumen", required=True, nargs="+", help="Resúmenes de Venta de las tiendas (.xlsx/.xls)")
    ap.add_argument("--periodo", help="AAAA-MM (si no se da, se toma de los Resúmenes)")
    ap.add_argument("--desde", help="dd/mm/aaaa (opcional, sobreescribe periodo)")
    ap.add_argument("--hasta", help="dd/mm/aaaa (opcional, sobreescribe periodo)")
    ap.add_argument("--salida", required=True, help="Ruta del archivo de salida (.xlsx)")
    ap.add_argument("--tolerancia", type=float, default=10.0, help="Tolerancia en $ para efectivo tienda-día")
    ap.add_argument("--sobrescribir", action="store_true", help="Sobrescribir celdas DOCUMENTO que ya tengan texto")
    ap.add_argument("--rehacer", action="store_true",
                    help="Borrar las columnas DOCUMENTO del periodo y volver a llenarlas desde cero")
    args = ap.parse_args()
    Conciliacion(args).correr()


if __name__ == "__main__":
    main()
```