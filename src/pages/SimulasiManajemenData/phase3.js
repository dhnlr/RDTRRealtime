import React from "react";
import { useHistory } from "react-router-dom";
import Select from 'react-select';

import { Header, Menu, Footer } from "../../components";

function SimulasiManajemenDataPhase3() {
    let history = useHistory();

    const options = [
        { value: 'chocolate', label: 'Banjir' },
        { value: 'strawberry', label: 'Macet' },
        { value: 'vanilla', label: 'Sampah' }
    ]

    const customStyles = {
        multiValueLabel: (styles) => ({
            ...styles,
            backgroundColor: "#4b49ac",
            color: 'white',
        }),
    }

    function goSimulasi() {
        history.push("/simulasimanajemendata/kebutuhandata")
    }

    function goManajemenData() {
        history.push("/simulasimanajemendata/kebutuhandata")
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
                                <div className="mb-2">
                                    <h1>Upload Data</h1>
                                    <p className="text-muted">Masukkan kebutuhan data</p>
                                </div>
                                <div className="accordion" id="accordionExample">
                                    <div className="card">
                                        <div className="card-header" id="headingOne">
                                            <h2 className="mb-0">
                                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#rdtr" aria-expanded="false" aria-controls="rdtr">
                                                    RDTR Kabupaten/Kota
                                                </button>
                                            </h2>
                                        </div>

                                        <div id="rdtr" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                            <div className="card-body">
                                                <div className="form-group">
                                                    <label>Unggah Data SHP</label>
                                                    <input type="file" name="img[]" className="file-upload-default"/>
                                                    <div className="input-group col-xs-12">
                                                        <input type="text" className="form-control file-upload-info" disabled="" placeholder="Upload Image"/>
                                                        <span className="input-group-append">
                                                        <button className="file-upload-browse btn btn-primary" type="button">Upload</button>
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4>Rincian Data</h4>
                                                <div className="form-group" data-select2-id="7">
                                                    <label>Tag (opsional)</label>
                                                    <Select
                                                        defaultValue={[options[1], options[2]]}
                                                        isMulti
                                                        name="tag"
                                                        options={options}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        styles={customStyles}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="tahun">Tahun (optional)</label>
                                                    <input id="tahun" type="number" name="tahun" className="form-control p-input"/>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="deskripsi">Deskripsi (opsional)</label>
                                                    <textarea id="deskripsi" name="deskripsi" className="form-control" rows="4"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header" id="headingTwo">
                                            <h2 className="mb-0">
                                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#buildingfootprint" aria-expanded="false" aria-controls="buildingfootprint">
                                                    Building Footprint
                                                </button>
                                            </h2>
                                        </div>
                                        <div id="buildingfootprint" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                                            <div className="card-body">
                                                Under Development
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header" id="headingThree">
                                            <h2 className="mb-0">
                                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#persiltanah" aria-expanded="false" aria-controls="persiltanah">
                                                    Persil Tanah
                                                </button>
                                            </h2>
                                        </div>
                                        <div id="persiltanah" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                                            <div className="card-body">
                                                Under Development
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="template-demo float-right">
                                    <button className="btn btn-light" type="button" onClick={() => goSimulasi()}>Kembali</button>
                                    <button className="btn btn-primary" type="button" onClick={() => goManajemenData()}>Simpan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default SimulasiManajemenDataPhase3;
