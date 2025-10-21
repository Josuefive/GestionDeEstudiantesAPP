// js/datos.js

// 1. Datos para el Login
const estudiantes = [
    { carnet: '20240001', password: 'estudiante123', nombre: 'Josue david Cinco Rosales' },
    { carnet: '20240002', password: 'estudiante123', nombre: 'Carlos Mendoza Silva' },
    { carnet: '20240003', password: 'estudiante123', nombre: 'María Rodríguez Torres' },
    // ... otros estudiantes
];

// 2. Datos para el Panel (Nuestra "Base de Datos" de calificaciones)
//    La clave (key) es el NÚMERO DE CARNET
const datosCompletosEstudiantes = {
    '20240001': {
        nombre: 'Josue david Cinco Rosales',
        carnet: '20240001',
        carrera: 'Ingeniería en Sistemas',
        ingreso: '2024',
        estado: 'Activo',
        metricas: {
            inscritas: 4,
            aprobadas: 2,
            promedio: 73.3,
            tasa: 67
        },
        materias: [
            {
                codigo: 'CS101',
                asignatura: 'Programación I',
                catedratico: 'Dr. Juan Carlos Méndez',
                horario: 'Lunes, Miércoles, Viernes 8:00-9:30 AM',
                notas: [
                    { tipo: 'Sist. 1', puntaje: 12, max: 15 },
                    { tipo: 'Sist. 2', puntaje: 14, max: 15 },
                    { tipo: 'Sist. 3', puntaje: 13, max: 15 },
                    { tipo: 'Sist. 4', puntaje: 15, max: 15 },
                    { tipo: 'Examen', puntaje: 35, max: 40 }
                ],
                total: 89,
                estado: 'Aprobado'
            },
            {
                codigo: 'MAT101',
                asignatura: 'Cálculo I',
                catedratico: 'Dra. María Elena Rodríguez',
                horario: 'Martes, Jueves 9:45-11:15 AM',
                notas: [
                    { tipo: 'Sist. 1', puntaje: 10, max: 15 },
                    { tipo: 'Sist. 2', puntaje: 12, max: 15 },
                    { tipo: 'Sist. 3', puntaje: 11, max: 15 },
                    { tipo: 'Sist. 4', puntaje: 13, max: 15 },
                    { tipo: 'Examen', puntaje: 28, max: 40 }
                ],
                total: 74,
                estado: 'Aprobado'
            },
            {
                codigo: 'CS201',
                asignatura: 'Base de Datos I',
                catedratico: 'MSc. Carlos Alberto Sánchez',
                horario: 'Lunes, Miércoles, Viernes 1:00-2:30 PM',
                notas: [
                    { tipo: 'Sist. 1', puntaje: 8, max: 15 },
                    { tipo: 'Sist. 2', puntaje: 9, max: 15 },
                    { tipo: 'Sist. 3', puntaje: 10, max: 15 },
                    { tipo: 'Sist. 4', puntaje: 12, max: 15 },
                    { tipo: 'Examen', puntaje: 18, max: 40 }
                ],
                total: 57,
                estado: 'Reprobado'
            },
            {
                codigo: 'CS102',
                asignatura: 'Algoritmos y Estructuras',
                catedratico: 'Dr. Juan Carlos Méndez',
                horario: 'Martes, Jueves 2:45-4:15 PM',
                notas: [
                    { tipo: 'Sist. 1', puntaje: 14, max: 15 },
                    { tipo: 'Sist. 2', puntaje: 13, max: 15 },
                    { tipo: 'Sist. 3', puntaje: null, max: 15 },
                    { tipo: 'Sist. 4', puntaje: null, max: 15 },
                    { tipo: 'Examen', puntaje: null, max: 40 }
                ],
                total: null,
                estado: 'En Curso'
            }
        ]
    },
    '20240002': {
        nombre: 'Carlos Mendoza Silva',
        carnet: '20240002',
        carrera: 'Ingeniería de Software',
        ingreso: '2024',
        estado: 'Activo',
        metricas: {
            inscritas: 1,
            aprobadas: 1,
            promedio: 70.0,
            tasa: 100
        },
        materias: [
            {
                codigo: 'CS102',
                asignatura: 'Algoritmos y Estructuras de Datos CS102',
                catedratico: 'Dr. Juan Carlos Méndez',
                horario: 'Martes, Jueves 2:45-4:15 PM',
                notas: [
                    { tipo: 'Sistemático 1', puntaje: 10, max: 15 },
                    { tipo: 'Sistemático 2', puntaje: 11, max: 15 },
                    { tipo: 'Sistemático 3', puntaje: 9, max: 15 },
                    { tipo: 'Sistemático 4', puntaje: 12, max: 15 },
                    { tipo: 'Examen Final', puntaje: 28, max: 40 }
                ],
                total: 70,
                estado: 'Aprobado'
            }
        ]
    }
};