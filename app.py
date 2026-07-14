from flask import Flask, render_template, request, jsonify
from datetime import datetime
import requests

app = Flask(__name__)


# =====================================================
# GOOGLE SHEET WEB APP URL
# Nanti isi setelah Google Apps Script dibuat
# =====================================================

GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7M3rXm85FLQowt4QGMAyfGft8J1QOdtiBXGgiaIr92_syoUgp98jhiUoGe2ILGAtsWA/exec"


# =====================================================
# DATA MENU RICE BOWL JUNDYUL
# =====================================================

MENU = {

    "650": {

        "Jundyul Ceplok": {

            "Nasi Putih": 10000,
            "Daun Jeruk": 11000

        },

        "Jundyul Karage": {

            "Nasi Putih": 13000,
            "Daun Jeruk": 13000

        },

        "Jundyul Suwir": {

            "Nasi Putih": 13000,
            "Daun Jeruk": 13000

        }

    },


    "800": {

        "Jundyul Karage": {

            "Nasi Putih": 15000,
            "Daun Jeruk": 15000

        },

        "Jundyul Suwir": {

            "Nasi Putih": 15000,
            "Daun Jeruk": 15000

        }

    }

}



# =====================================================
# PENYIMPANAN SEMENTARA TRANSAKSI
# Nanti tetap masuk Google Spreadsheet
# =====================================================

transactions = []



# =====================================================
# HALAMAN UTAMA
# =====================================================

@app.route("/")
def index():

    return render_template("index.html")



# =====================================================
# MENGIRIM DATA MENU KE WEBSITE
# =====================================================

@app.route("/menu")
def get_menu():

    return jsonify(MENU)



# =====================================================
# DASHBOARD PENJUALAN
# =====================================================

@app.route("/summary")
def summary():

    total_penjualan = 0
    total_tunai = 0
    total_qris = 0


    for item in transactions:


        total_penjualan += item["total"]


        if item["pembayaran"] == "Tunai":

            total_tunai += item["total"]


        elif item["pembayaran"] == "QRIS":

            total_qris += item["total"]



    return jsonify({

        "jumlah_transaksi": len(transactions),

        "total": total_penjualan,

        "tunai": total_tunai,

        "qris": total_qris

    })

# =====================================================
# RIWAYAT TRANSAKSI
# =====================================================

@app.route("/history")
def history():

    return jsonify(transactions[::-1])



# =====================================================
# PROSES CHECKOUT / LUNAS
# =====================================================

@app.route("/checkout", methods=["POST"])
def checkout():

    data = request.json


    nama = data["nama"]
    cup = data["cup"]
    menu = data["menu"]
    nasi = data["nasi"]
    qty = int(data["qty"])
    harga_satuan = int(data["harga_satuan"])
    total = int(data["total"])
    pembayaran = data["pembayaran"]


    uang_dibayar = int(data.get("uang_dibayar",0))


    if pembayaran == "Tunai":

        kembalian = uang_dibayar - total

    else:

        uang_dibayar = 0
        kembalian = 0



    waktu = datetime.now()



    transaksi = {

        "tanggal": waktu.strftime("%d-%m-%Y"),

        "jam": waktu.strftime("%H:%M:%S"),

        "nama": nama,

        "cup": cup,

        "menu": menu,

        "nasi": nasi,

        "qty": qty,

        "harga_satuan": harga_satuan,

        "total": total,

        "pembayaran": pembayaran,

        "uang_dibayar": uang_dibayar,

        "kembalian": kembalian,

        "status": "Lunas"

    }



    # simpan sementara

    transactions.append(transaksi)



    # ==============================
    # KIRIM GOOGLE SHEET
    # ==============================

    if GOOGLE_SCRIPT_URL != "":


        try:

            response = requests.post(

                GOOGLE_SCRIPT_URL,

                json=transaksi,

                timeout=10

            )


            print(
                "Google Sheet:",
                response.text
            )


        except Exception as error:


            print(
                "Gagal kirim Google Sheet:",
                error
            )




    return jsonify({

        "status":"success",

        "message":"Pembayaran berhasil",

        "kembalian":kembalian

    })

# =====================================================
# JALANKAN FLASK
# =====================================================

if __name__ == "__main__":


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )