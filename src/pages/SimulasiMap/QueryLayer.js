import axios from "axios"

import { config } from "../../Constants";

function getScreenshotData(screenshot, id, historical){
    return new Promise((resolve, reject) => {
        var sesudah = axios.get(config.url.ARCGIS_URL + "/Versioning/bangunan_analisis_process/FeatureServer/0/query", {
            params: {
                where: "objectid="+id??53035208,
                outFields: "*",
                returnGeometry: false,
                f: "json"
            }
        })
        var sebelum = axios.get(config.url.ARCGIS_URL + "/Versioning/bangunan_analisis/FeatureServer/0/query", {
            params: {
                where: "objectid="+historical,
                outFields: "*",
                returnGeometry: false,
                f: "json"
            }
        })
        Promise.all([sesudah, sebelum])
        .then(result => {
            var attr = result[0].data.features[0].attributes
            var attr2 = result[1].data.features[0].attributes
            screenshot.id_bangunan = attr.objectid
            screenshot.kabkot = attr.wadmkk
            screenshot.jenis = attr.jenis
            screenshot.simulasi.pembangunan_optimum = String(attr.status_kdbklb)
            screenshot.simulasi.pembangunan_optimum_sebelum = String(attr2.status_kdbklb)
            screenshot.simulasi.air = attr.izin_air_y5 || ""
            screenshot.simulasi.air_sebelum = attr2.izin_air_y5 || ""
            screenshot.simulasi.kemacetan = attr.izin_macet || ""
            screenshot.simulasi.kemacetan_sebelum = attr2.izin_macet || ""
            screenshot.rangkuman.semua = "Kosong" + "; " + attr.melampaui_tinggi + "; " + attr.melampaui_fa + "; " + "kosong"
            screenshot.rangkuman.air = "Kosong"
            screenshot.rangkuman.pembangunan_optimum = attr.melampaui_tinggi || ""
            screenshot.rangkuman.floor_area = attr.melampaui_fa || ""
            screenshot.rangkuman.kemacetan = "Kosong"
            screenshot.luas_tapak = String(attr.luas_m2)
            screenshot.luas_tapak_sebelum = String(attr2.luas_m2)
            screenshot.tinggi_bangunan = String(attr.jlh_lantai)
            screenshot.tinggi_bangunan_sebelum = String(attr2.jlh_lantai)
            screenshot.floor_area_total = String(attr.fa)
            screenshot.floor_area_total_sebelum = String(attr2.fa)
            screenshot.floor_area_maks = String("-")
            screenshot.floor_area_maks_sebelum = String("-")
            screenshot.jumlah_penduduk = String(attr.pertambahan_penduduk)
            screenshot.jumlah_penduduk_sebelum = String(attr2.pertambahan_penduduk)
            screenshot.kapasitas_jalan = String(attr.kapasitas)
            screenshot.kapasitas_jalan_sebelum = String(attr.kapasitas)
            screenshot.luas_jalan_dibutuhkan = String(attr.bangkitan_ruasjalan)
            screenshot.luas_jalan_dibutuhkan_sebelum = String(attr.bangkitan_ruasjalan)
            screenshot.level_of_service = String(attr.los_num)
            screenshot.level_of_service_sebelum = String(attr2.los_num)
            screenshot.kebutuhan_air = String(attr.keb_air_harian_y5)
            screenshot.kebutuhan_air_sebelum = String(attr.keb_air_harian_y5)
            screenshot.supply_air = String(attr.pdam_kapasitas_harian)
            screenshot.supply_air_sebelum = String(attr.pdam_kapasitas_harian)
            screenshot.zona = String(attr.namazona)
            screenshot.kodezona = String(attr.kdzona)
            screenshot.subzona = String(attr.namaszona)
            screenshot.kodesubzona = String(attr.kdszona)
            screenshot.kdb = String(attr.kdb)
            screenshot.klb = String(attr.klb)
            screenshot.kdh = String(attr.kdh)
            screenshot.lantai_max = String(attr.lantai_max)
            screenshot.luas_jalan_y1 = String(attr.bangkitan_ruasjalan_y6)
            screenshot.luas_jalan_y2 = String(attr.bangkitan_ruasjalan_y7)
            screenshot.luas_jalan_y3 = String(attr.bangkitan_ruasjalan_y8)
            screenshot.luas_jalan_y4 = String(attr.bangkitan_ruasjalan_y9)
            screenshot.luas_jalan_y5 = String(attr.bangkitan_ruasjalan_y10)
            screenshot.los_y1 = String("-")
            screenshot.los_y2 = String("-")
            screenshot.los_y3 = String("-")
            screenshot.los_y4 = String("-")
            screenshot.los_y5 = String("-")
            screenshot.status_macet_y1 = String(attr.izin_macet_y6)
            screenshot.status_macet_y2 = String(attr.izin_macet_y7)
            screenshot.status_macet_y3 = String(attr.izin_macet_y8)
            screenshot.status_macet_y4 = String(attr.izin_macet_y9)
            screenshot.status_macet_y5 = String(attr.izin_macet_y10)
            screenshot.kebutuhan_air_y1 = String(attr.keb_air_harian_y6)
            screenshot.kebutuhan_air_y2 = String(attr.keb_air_harian_y7)
            screenshot.kebutuhan_air_y3 = String(attr.keb_air_harian_y8)
            screenshot.kebutuhan_air_y4 = String(attr.keb_air_harian_y9)
            screenshot.kebutuhan_air_y5 = String(attr.keb_air_harian_y10)
            screenshot.status_air_y1 = String(attr.izin_air_y6)
            screenshot.status_air_y2 = String(attr.izin_air_y7)
            screenshot.status_air_y3 = String(attr.izin_air_y8)
            screenshot.status_air_y4 = String(attr.izin_air_y9)
            screenshot.status_air_y5 = String(attr.izin_air_y10)
            resolve(screenshot)
        })
    })
}

export default getScreenshotData
