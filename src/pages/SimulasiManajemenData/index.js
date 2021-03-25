import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

import { Header, Menu, Footer } from "../../components";

function SimulasiManajemenData() {
    let history = useHistory();
    const { register, errors, control, handleSubmit } = useForm();
    const onSubmit = data => {
        console.log(data); 
        goManajemenDataPhase2()
    };

    const provinceData = [
        {
            name: "DKI Jakarta",
            city: ["Jakarta Utara", "Jakarta Barat", "Jakarta Pusat", "Jakarta Timur", "Jakarta Selatan"]
        },
        {
            name: "Banten",
            city: ["Kota Tangerang", "Kabupaten Tangerang", "Kota Tangerang Selatan"]
        },
        {
            name: "Jawa barat",
            city: ["Kota Depok", "Kota Bogor", "Kabupaten Bogor", "Kota Bandung"]
        }
    ];

    const [{ province, city }, setData] = useState({
        province: "DKI Jakarta",
        city: ""
    });

    const provinces = provinceData.map((province) => (
        <option key={province.name} value={province.name}>
            {province.name}
        </option>
    ));

    const cities = provinceData.find(item => item.name === province)?.city.map((cities) => (
        <option key={cities} value={cities}>
            {cities}
        </option>
    ));


    function goManajemenDataPhase2() {
        history.push("/simulasimanajemendata/kebutuhandata")
    }

    function handleProvinceChange(event) {
        setData(data => ({ city: '', province: event.target.value }));
    }

    function handleCityChange(event) {
        setData(data => ({ ...data, city: event.target.value }));
    }

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="simulasi" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-12">
                                <div class="mb-2">
                                    <h1>Proyek Saya</h1>
                                    <p className="text-muted">Silahkan lengkapi borang di bawah ini</p>
                                </div>
                                <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                                    {/* register your input into the hook by invoking the "register" function */}
                                    <div class="form-group">
                                        <label for="namaproyek">Nama Proyek</label>
                                        <input className="form-control p-input" id="namaproyek" name="namaproyek" defaultValue="" placeholder="Nama Proyek" ref={register} />
                                    </div>

                                    {/* include validation with required or other standard HTML validation rules */}
                                    <div class="form-group">
                                        <label for="provinsi">Provinsi</label>
                                        <Controller
                                            name="provinsi"
                                            control={control}
                                            defaultValue={null}
                                            render={props =>
                                                <select className="form-control" id="provinsi" name="provinsi" value={province} onChange={handleProvinceChange} ref={register}>
                                                    {provinces}
                                                </select>
                                            }
                                        />

                                    </div>
                                    {/* errors will return when field validation fails  */}
                                    {errors.exampleRequired && <span>This field is required</span>}
                                    <div class="form-group">
                                        <label for="kota">Kota</label>
                                        <Controller
                                            name="kota"
                                            control={control}
                                            defaultValue={null}
                                            render={props =>
                                                <select className="form-control" id="kota" name="kota" value={city} onChange={handleCityChange} ref={register}>
                                                    {cities}
                                                </select>
                                            }
                                        />
                                    </div>
                                    <div className="template-demo float-right">
                                        <button className="btn btn-light" type="button">Kembali</button>

                                        <button className="btn btn-primary" type="submit">Selanjutnya</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default SimulasiManajemenData;
