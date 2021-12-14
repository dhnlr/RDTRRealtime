const getDefExp = (params) => {
    let exp = ''
    if(params.projectId !== undefined && params.projectId !== null){
        exp += `id_project = ${params.projectId} `
    }
    if(params.skenarioId !== undefined && params.skenarioId !== null){
        exp += ` AND id_skenario = ${params.skenarioId} `
    }
    if(params.dataKe !== undefined && params.dataKe !== null) {
        exp += ` AND data_ke = ${params.dataKe} `
    }
    if(params.nambwp !== undefined && params.nambwp !== null && params.nambwp !== "null") {
        exp += ` AND nambwp = '${params.nambwp}' `
    }
    if(params.nasbwp !== undefined && params.nasbwp !== null && params.nasbwp !== "null") {
        exp += ` AND nasbwp = '${params.nasbwp}' `
    }
    if(params.kodblk !== undefined && params.kodblk !== null && params.kodblk !== "null") {
        exp += ` AND kodblk = '${params.kodblk}' `
    }
    if(params.kodsbl !== undefined && params.kodsbl !== null && params.kodsbl !== "null") {
        exp += ` AND kodsbl = '${params.kodsbl}' `
    }
    if(params.wadmkd !== undefined && params.wadmkd !== null && params.wadmkd !== "null") {
        exp += ` AND wadmkd = '${params.wadmkd}' `
    }
    if(params.userId !== undefined && params.userId !== null && params.userId !== "null") {
        exp += ` AND userid = '${params.userId}' `
    }
    return exp
}

export default getDefExp
