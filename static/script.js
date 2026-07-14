let MENU = {};
let hargaSatuan = 0;


// ==============================
// FORMAT RUPIAH
// ==============================

function rupiah(angka){

    return "Rp " + Number(angka).toLocaleString("id-ID");

}


// ==============================
// LOAD MENU DARI FLASK
// ==============================

async function loadMenu(){

    try{

        const response = await fetch("/menu");

        MENU = await response.json();

        console.log("MENU:", MENU);

    }

    catch(error){

        console.log("Gagal mengambil menu:", error);

    }

}


loadMenu();



// ==============================
// PILIH CUP
// ==============================

document.getElementById("cup")
.addEventListener("change", function(){


    let cup = this.value;


    let menuSelect = document.getElementById("menu");

    let nasiSelect = document.getElementById("nasi");



    menuSelect.innerHTML =
    `<option value="">Pilih Menu</option>`;


    nasiSelect.innerHTML =
    `<option value="">Pilih Nasi</option>`;


    document.getElementById("harga").value="";
    document.getElementById("totalHarga").value="";


    hargaSatuan = 0;



    if(cup === ""){

        return;

    }



    if(!MENU[cup]){

        console.log("Cup tidak ditemukan");

        return;

    }



    Object.keys(MENU[cup]).forEach(function(menu){


        menuSelect.innerHTML +=

        `
        <option value="${menu}">
        ${menu}
        </option>
        `;


    });


});





// ==============================
// PILIH MENU
// ==============================

document.getElementById("menu")
.addEventListener("change", function(){


    let cup =
    document.getElementById("cup").value;


    let menu =
    this.value;


    let nasiSelect =
    document.getElementById("nasi");



    nasiSelect.innerHTML =
    `<option value="">Pilih Nasi</option>`;



    document.getElementById("harga").value="";


    hargaSatuan = 0;



    if(menu === ""){

        return;

    }



    Object.keys(MENU[cup][menu])
    .forEach(function(nasi){


        nasiSelect.innerHTML +=

        `
        <option value="${nasi}">
        ${nasi}
        </option>
        `;


    });



});





// ==============================
// PILIH NASI
// ==============================

document.getElementById("nasi")
.addEventListener("change", function(){


    let cup =
    document.getElementById("cup").value;


    let menu =
    document.getElementById("menu").value;


    let nasi =
    this.value;



    hargaSatuan =
    MENU[cup][menu][nasi];



    document.getElementById("harga").value =
    rupiah(hargaSatuan);



    hitungTotal();


});





// ==============================
// JUMLAH
// ==============================

document.getElementById("plus")
.addEventListener("click",function(){


    let qty =
    document.getElementById("qty");


    qty.value =
    Number(qty.value)+1;


    hitungTotal();


});





document.getElementById("minus")
.addEventListener("click",function(){


    let qty =
    document.getElementById("qty");


    if(Number(qty.value)>1){

        qty.value =
        Number(qty.value)-1;

    }


    hitungTotal();


});





// ==============================
// TOTAL
// ==============================

function hitungTotal(){


    let qty =
    Number(document.getElementById("qty").value);



    let total =
    hargaSatuan * qty;



    document.getElementById("totalHarga").value =
    rupiah(total);


}







// ==============================
// PEMBAYARAN
// ==============================

document.getElementById("pembayaran")
.addEventListener("change",function(){


    let tunaiBox =
    document.getElementById("tunaiBox");



    if(this.value === "QRIS"){


        tunaiBox.style.display="none";


        document.getElementById("uang").value="";

        document.getElementById("kembalian").value="";


    }

    else{


        tunaiBox.style.display="block";


    }



});







// ==============================
// KEMBALIAN
// ==============================

document.getElementById("uang")
.addEventListener("input",function(){


    let uang =
    Number(this.value);



    let qty =
    Number(document.getElementById("qty").value);



    let total =
    hargaSatuan * qty;



    let kembali =
    uang-total;



    if(kembali < 0){


        document.getElementById("kembalian").value =
        "Uang kurang";


    }

    else{


        document.getElementById("kembalian").value =
        rupiah(kembali);


    }


});








// ==============================
// CHECKOUT
// ==============================

document.getElementById("checkout")
.addEventListener("click",function(){


    let nama =
    document.getElementById("nama").value;


    let cup =
    document.getElementById("cup").value;


    let menu =
    document.getElementById("menu").value;


    let nasi =
    document.getElementById("nasi").value;


    let qty =
    Number(document.getElementById("qty").value);


    let pembayaran =
    document.getElementById("pembayaran").value;


    let total =
    hargaSatuan * qty;


    let uang =
    Number(document.getElementById("uang").value || 0);




    if(nama===""){

        alert("Isi nama pembeli");

        return;

    }


    if(hargaSatuan===0){

        alert("Pilih menu terlebih dahulu");

        return;

    }



    if(pembayaran==="Tunai" && uang < total){

        alert("Uang kurang");

        return;

    }




    fetch("/checkout",{


        method:"POST",


        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({


            nama:nama,

            cup:cup,

            menu:menu,

            nasi:nasi,

            qty:qty,

            harga_satuan:hargaSatuan,

            total:total,

            pembayaran:pembayaran,

            uang_dibayar:uang


        })


    })


    .then(response=>response.json())


    .then(data=>{


        alert("✅ Pembayaran Lunas");


        resetForm();


        loadSummary();


        loadHistory();


    })



});








// ==============================
// RESET FORM
// ==============================

function resetForm(){


    document.getElementById("nama").value="";


    document.getElementById("cup").value="";


    document.getElementById("menu").innerHTML =
    `<option>Pilih Menu</option>`;


    document.getElementById("nasi").innerHTML =
    `<option>Pilih Nasi</option>`;


    document.getElementById("harga").value="";


    document.getElementById("qty").value=1;


    document.getElementById("totalHarga").value="";


    document.getElementById("uang").value="";


    document.getElementById("kembalian").value="";


    hargaSatuan=0;


}







// ==============================
// DASHBOARD
// ==============================

function loadSummary(){


    fetch("/summary")

    .then(response=>response.json())

    .then(data=>{


        document.getElementById("total").innerHTML =
        rupiah(data.total);


        document.getElementById("jumlah").innerHTML =
        data.jumlah_transaksi;


        document.getElementById("tunai").innerHTML =
        rupiah(data.tunai);


        document.getElementById("qris").innerHTML =
        rupiah(data.qris);


    });


}







// ==============================
// HISTORY
// ==============================

function loadHistory(){


    fetch("/history")

    .then(response=>response.json())

    .then(data=>{


        let html="";


        data.forEach(item=>{


            html += `

            <tr>

            <td>${item.tanggal}</td>

            <td>${item.jam}</td>

            <td>${item.nama}</td>

            <td>${item.cup}</td>

            <td>${item.menu}</td>

            <td>${item.nasi}</td>

            <td>${item.qty}</td>

            <td>${rupiah(item.total)}</td>

            <td>${item.pembayaran}</td>

            <td>${item.status}</td>


            </tr>

            `;


        });



        document.getElementById("historyTable").innerHTML = html;


    });



}







// LOAD AWAL

loadSummary();

loadHistory();