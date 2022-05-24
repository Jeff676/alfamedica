export const patientAge = (birthdayString) => {
    const today = new Date()
    const birthday = new Date(birthdayString.seconds*1000)
    var age = today.getFullYear() - birthday.getFullYear()

    if (age > 2) {
        if (today.getMonth() - birthday.getMonth() > 0) {
            return age + ' años'
        }

         if (today.getMonth() - birthday.getMonth() == 0) {
            if (today.getDate() - birthday.getDate() >= 0) {
                return age + ' años'
            } else {
                // age = today.getMonth() - birthday.getMonth()
                return age - 1 + ' años'
            }
        }

        if (today.getMonth() - birthday.getMonth() < 0) {
            return age - 1 + ' años'
        }
    }

    if (age == 2) {
        if (today.getMonth() - birthday.getMonth() > 0) {
            return age + ' años'
        }

        if (today.getMonth() - birthday.getMonth() == 0) {
            if (today.getDate() - birthday.getDate() >= 0) {
                return age + ' años'
            } else {
                // age = today.getDate() - birthday.getDate()
                return age + 24 + ' meses'
            }
        }

        if (today.getMonth() - birthday.getMonth() < 0) {
            age = today.getMonth() - birthday.getMonth()
            return age + 24 + ' meses'
        }
    }

    if (age == 1 ) {
        age = today.getMonth() - birthday.getMonth() + 12
        return age + ' meses'
    }

    if (age == 0) {
        age = today.getMonth() - birthday.getMonth()
        if (age > 1 ) {
            return age + ' meses'
        }

        if (age == 1) {
            if (today.getDate() - birthday.getDate() > 0 ) {
                return age + ' mes'
            }
            if (today.getDate() - birthday.getDate() <= 0 ) {
                return 'Menos de un mes'
            }

        }

        if (age == 0) {
            age = today.getDate() - birthday.getDate()
            return age + ' dias'
        }
    }
}