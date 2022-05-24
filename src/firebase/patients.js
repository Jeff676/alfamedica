import { firebaseApp } from '@/firebase/init.js'
import { getFirestore, collection, addDoc, query, where, getDocs, limit, collectionGroup, doc, setDoc, serverTimestamp } from 'firebase/firestore'

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
            hospitaized: newPatient.hospitalized,
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

// Get Medical Record
export const getPatientData = async  (id) => {
    const q = query(collection(db, "patients"), where("patient_id", "==", id), limit(1))
    const querySnapShot = await getDocs(q)
    // const patientData = querySnapShot.docs.map(doc => doc.data())
    // return patientData
    return querySnapShot
}

export const getMedicalRecord = async  (id) => {
    const q = query(collection(db, `patients/${id}/medicalRecord`))
    const querySnapShot = await getDocs(q)

    return querySnapShot
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
}

export const addMedicalRecord = async (id, mc, cs) => {
    const collectionRef = collection(db, `patients/${id}/medicalRecords`)
    const docRef = await addDoc(collectionRef, {
        mc : mc,
        currentSick : cs,
        createAt: serverTimestamp()
    })

    return docRef.id
}