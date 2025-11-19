# Class Diagram

```mermaid
classDiagram
    class Admin {
        +string username
        +string password
        +void managePatients()
        +void manageDoctors()
        +void manageAppointments()
        +void manageMedicines()
        +void manageFacilities()
    }

    class Patient {
        +string name
        +int age
        +string gender
        +string contactInfo
        +string address
        +string diseaseHistory
        +void viewRecords()
    }

    class Appointment {
        +int appointmentID
        +string patientName
        +string doctorName
        +string appointmentDate
        +string appointmentTime
        +string status
        +void bookAppointment()
        +void cancelAppointment()
        +void updateAppointment()
    }

    class Medicine {
        +string medicineName
        +string manufacturer
        +string expiryDate
        +string description
        +void updateStock()
        +void viewDetails()
    }

    class Doctor {
        +string name
        +string specialization
        +string contactInfo
        +string availability
        +void viewAppointments()
        +void updateAvailability()
    }

    class Facility {
        +string facilityName
        +string facilityType
        +string description
        +void viewFacility()
    }

    Admin --> Patient : manages
    Admin --> Doctor : manages
    Admin --> Appointment : manages
    Admin --> Medicine : manages
    Admin --> Facility : manages
    Appointment --> Patient : belongsTo
    Appointment --> Doctor : handledBy
