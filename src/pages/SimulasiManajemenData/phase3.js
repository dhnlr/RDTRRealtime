import React from "react";
import { useHistory } from "react-router-dom";

import { Header, Menu, Footer } from "../../components";

function SimulasiManajemenDataPhase3() {
    let history = useHistory();

    function goManajemenData() {
        history.push("/simulasimanajemendata/uploaddata")
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
                                    <h1>Upload Data</h1>
                                    <p className="text-muted">Masukkan kebutuhan data</p>
                                </div>
                                <div className="accordion" id="accordionExample">
                                    <div className="card">
                                        <div className="card-header" id="headingOne">
                                            <h2 className="mb-0">
                                                <button className="btn btn-link" type="button" data-toggle="collapse" data-target="#rdtr" aria-expanded="true" aria-controls="rdtr">
                                                    RDTR Kabupaten/Kota
                                                </button>
                                            </h2>
                                        </div>

                                        <div id="rdtr" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
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
                                                <div className="form-group">
                                                    <label htmlFor="tahun">Unggah Data SHP</label>
                                                    <input id="tahun" type="number" name="tahun" className="form-control p-input"/>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="deskripsi">Unggah Data SHP</label>
                                                    <textarea id="deskripsi" name="deskripsi" className="form-control" rows="4"/>
                                                </div>
                                                <div class="form-group" data-select2-id="7">
                    <label>Multiple select using select 2</label>
                    <select class="js-example-basic-multiple w-100 select2-hidden-accessible" multiple="" data-select2-id="4" tabindex="-1" aria-hidden="true">
                      <option value="AL" data-select2-id="8">Alabama</option>
                      <option value="WY" data-select2-id="9">Wyoming</option>
                      <option value="AM" data-select2-id="10">America</option>
                      <option value="CA" data-select2-id="11">Canada</option>
                      <option value="RU" data-select2-id="12">Russia</option>
                    </select>
                    <span 
                    class="select2 select2-container select2-container--default select2-container--focus select2-container--open select2-container--above" 
                    dir="ltr" 
                    data-select2-id="5" 
                    style={{width: "464px"}}>
                        <span class="selection">
                            <span class="select2-selection select2-selection--multiple" role="combobox" aria-haspopup="true" aria-expanded="true" tabindex="-1" aria-disabled="false" aria-owns="select2-c5n6-results" aria-activedescendant="select2-c5n6-result-zae0-AL">
                                <ul class="select2-selection__rendered">
                                    <li class="select2-search select2-search--inline">
                                        <input class="select2-search__field" type="search" tabindex="0" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" placeholder="" style={{width: "0.75em"}} aria-controls="select2-c5n6-results" aria-activedescendant="select2-c5n6-result-zae0-AL"/>
                                        </li></ul></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
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
                                    <button className="btn btn-light" type="button">Kembali</button>
                                    <button className="btn btn-primary" type="button" onClick={() => goManajemenData()}>Lanjutkan ke Simulasi</button>
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
