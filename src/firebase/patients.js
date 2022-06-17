import { firebaseApp } from '@/firebase/init.js'
import { getFirestore, collection, addDoc, query, where, getDocs, limit, collectionGroup, doc, setDoc, serverTimestamp, updateDoc, orderBy, onSnapshot } from 'firebase/firestore'
import { fixLocalTimeVZLA } from '../helpers/fixLocalTimeVZLA'

const db = getFirestore(firebaseApp)

// Verify if patient exist
export const verify_patient = async (id) => {
    const patientRef = collection(db, "patients")
    const q = query(patientRef, where("patient_id", "==", id))
    try {
        const querySnapshot = await getDocs(q)
        const patientsList = querySnapshot.docs.map(doc => doc.data())
        
        if (patientsList.length > 0) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log("Error getting cached document:", e)
    }
}

// Add patient to db
export const add_patient = async (newPatient) => {
    try {
        const docRef = await addDoc(collection(db, "patients"), {
            patient_id: newPatient.patient_id,
            name: newPatient.name,
            nationalityType: newPatient.nationalityType,
            birthday: new Date(newPatient.birthday),
            size: newPatient.size,
            gender: newPatient.gender.value,
            address: newPatient.address,
            country: newPatient.country,
            state: newPatient.state,
            city: newPatient.city,
            phone: newPatient.phone,
            phone2: newPatient.phone2,
            email: newPatient.email,
            profesion: newPatient.profesion,
            hospitalized: newPatient.hospitalized,
            waitingAdvise: newPatient.waitingAdvise,
            doctor: newPatient.doctor,
            doctorAdviser: newPatient.doctorAdviser
        })
        return docRef.id
    } catch(e) {
        console.error('Error: ', e)
        return null
    }
}

// Get all patients
export const getPatients = async () => {
    const patientsSnapShop = await getDocs(collection(db, "patients")) // Devuelve un Objeto Firebase , dentro estan todos los documentos
    const patients = patientsSnapShop.docs.map(doc => doc.data())  // Devuelve un array con los documentos
    return patients
}

// var openMedicalRecord = []
// Get Patients Hospitalized

// async function prueba(doc) {
//     console.log('works!', doc.id)
//     const medicalRecord = await getOpenMedicalRecord(doc.id)

//     openMedicalRecord.push(medicalRecord[0].plan)
//     console.log(openMedicalRecord[0])
// }

export const getActivePatients = async () => {
    var openMedicalRecords = []
    const patientsRef = collection(db, "patients")
    const q = query(patientsRef, where("hospitalized", "==", true))
    const patientsSnapShot = await getDocs(q)
    const patients = patientsSnapShot.docs.map(doc => doc.data())

    // const ids = patientsSnapShot.docs.map(doc => doc.id)

    // for (let index = 0; index < ids.length; index++) {
    //     const element = await getOpenMedicalRecord(ids[index])
    //     openMedicalRecords.push(element[0])
    // }

    await Promise.all(patientsSnapShot.docs.map(async doc => {
        const element = await getOpenMedicalRecord(doc.id)
        openMedicalRecords.push(element[0])
    }))


    const res = {
        patients: patients,
        openMedicalRecords: openMedicalRecords
    }

    return res
}



// Get Open Medical Records
export const getOpenMedicalRecord = async (id) => {
    const docRef = collection(db, `patients/${id}/medicalRecords`)
    const q = query(docRef, where("state", "==", "open"))

    const querySnapShot = await getDocs(q)
    console.log(`Id del paciente ${id}  -- query de la historia ${querySnapShot}`)

    // querySnapShot.forEach(doc => console.log(doc.id))
    const OpenMedicalRecordData = querySnapShot.docs.map(doc => doc.data())
    // console.log(OpenMedicalRecordData)
    return OpenMedicalRecordData
}

// Get Medical Record
export const getPatientData = async  (id) => {
    const q = query(collection(db, "patients"), where("patient_id", "==", id), limit(1))
    const querySnapShot = await getDocs(q)
    // const patientData = querySnapShot.docs.map(doc => doc.data())
    // return patientData
    return querySnapShot
}

export const getMedicalDocs = async (patientId, medicalRecordId) => {
    const q = query(collection(db, `patients/${patientId}/medicalRecords/${medicalRecordId}/medicalDocs`), orderBy("createAt"))
    const querySnapShot = await getDocs(q)
    
    return querySnapShot
}

export const getMedicalRecord = async  (id) => {
    const q = query(collection(db, `patients/${id}/medicalRecords`))
    const querySnapShot = await getDocs(q)
    return querySnapShot
}



// const q = query(collectionGroup(db, 'M9xe4M0SJSIPOawH3fOV'), where("patient_id", "==", id))

// const querySnapshot = await getDocs(q)
// querySnapshot.forEach((doc) => {
//     console.log(doc.data());
// });


// Las siguientes lineas crean un documento en la colecion cities con el id BJ, dentro de dicho documento agrega una subcoleccion llamada landmarks y un documeneto con la id 01
// const citiesRef = collection(db, 'cities');
// await Promise.all([
//     setDoc(doc(citiesRef, 'BJ', 'landmarks', '01'), {
//         name: 'Beijing Ancient Observatory',
//         type: 'museum'
//     })
// ])


// El siguiente query trae los datos de todas las subcolecciones landmarks 
// const museums = query(collectionGroup(db, 'landmarks'), where('type', '==', 'museum'));

// el siguiente query trae solo los datos de la subcoleccion landmarks donde la ciudad sea BJ
// const ciudad = 'BJ'
// const museums = query(collection(db, `cities/${ciudad}/landmarks`), where('type', '==', 'museum'));

// Obtenemos todos los documentos del query
// const querySnapshot = await getDocs(museums)

// cada documento se pinata por la consola
// querySnapshot.forEach((doc) => {
//     console.log(doc.id);
// });


// *** create a new medical record ( nueva historia medica) *** //
export const addMedicalRecord = async (id, medicalRecordData) => {
    try {
        const collectionRef = collection(db, `patients/${id}/medicalRecords`)
        const docRef = await addDoc(collectionRef, {
            reasonForConsultation : medicalRecordData.reasonForConsultation,
            currentIllness: medicalRecordData.currentIllness,
            bloodPresure : medicalRecordData.bloodPresure,
            heartRate : medicalRecordData.heartRate,
            breathingFrequency : medicalRecordData.breathingFrequency,
            weight : medicalRecordData.weight,
            notes: medicalRecordData.notes,
            diagnostic : medicalRecordData.diagnostic,
            plan : medicalRecordData.plan,
            state: 'open',
            careBy: medicalRecordData.careBy.name,
            signBy: medicalRecordData.signBy,
            createAt: serverTimestamp()
        })
    
        return docRef.id
    } catch(e) {
        console.error(e)
        return null
    }
}

export const addMedicalDoc = async (doc, idPatient, idMedicalRecord) => {
    try {
        const docRef = await addDoc(collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/medicalDocs`), {
            title: doc.title,
            content : doc.content,
            createAt: doc.createAt
        })
        return docRef.id
    } catch(e) {
        console.error(e)
        return null
    }
}

// Update Personal and Family Backgrounds
export const updateBackgrounds = async (idPatient, personalBackgrounds, familyBackgrounds) => {
    try {
        // const washingtonRef = doc(db, "cities", "DC")
        const docRef = doc(db, "patients", idPatient)

        await updateDoc(docRef, {
            personalBackgrounds,
            familyBackgrounds
        })
        return true
    } catch(e) {
        console.error(e)
        return false
    }
}

export const updateBasicInfo = async (idPatient, name, size, weight, gender, profesion, birthday) => {
    gender = gender == 'Masculino' ? 'm' : 'f'
    try {
        const docRef = doc(db, "patients", idPatient)

        await updateDoc(docRef, {
            name,
            size,
            weight,
            gender,
            profesion,
            birthday : new Date(birthday)
        })
        return true
    } catch(e) {
        console.error(e)
        return false
    }
}

export const updateState = async (idPatient, idMedicalRecord) => {
    try {
        const docRef = doc(db, `patients/${idPatient}/medicalRecords/`, idMedicalRecord)

        await updateDoc(docRef, {
            state: 'close'
        })
        return true
    } catch(e) {
        console.error(e)
        return false
    }
}

export const addMedicalOrders = async (idPatient, idMedicalRecord, medicalOrders) => {
    try {
        const docRef = collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/medicalorders`)
        await addDoc(docRef, {
            createAt: serverTimestamp(),
            orders : medicalOrders,
            signBy: 'Dr Signed'
        })
        return true
    } catch(e) {
        console.log(e)
        return flase
    }
}

export const getMedicalOrders = async (patientId, medicalRecordId) => {
    try {
        const q = query(collection(db, `patients/${patientId}/medicalRecords/${medicalRecordId}/medicalorders`), orderBy("createAt", "desc"))
        const querySnapShot = await getDocs(q)
        const medicalOrders = querySnapShot.docs.map(doc => doc.data())

        return medicalOrders

    } catch (e) {
        console.log(e)
        return false
    }

}


// Esto lo colocare en un archivo aparte solo para evoluciones
// export const getMedicalEvolutions = async (idPatient, idMedicalRecord, callback) => {
//     const q = query(collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/medicalEvolution`), orderBy("createAt", "desc"))
//     onSnapshot(q, callback)
// }

// export const addMedicalEvolution = async (idPatient, idMedicalRecord, data) => {
//     try {

//         const docRef = await addDoc(collection(db, `patients/${idPatient}/medicalRecords/${idMedicalRecord}/medicalEvolution`), {
//             createAt : fixLocalTimeVZLA(),
//             body : data.body,
//             signBy : data.signBy
//         })
//         return docRef.id
//     } catch(e) {
//         console.log(e)
//         return null
//     }
// }
// fin dle bloque evoluciones