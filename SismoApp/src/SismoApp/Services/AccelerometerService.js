
import { Accelerometer } from 'expo-sensors';


export default class AccelerometerService {
    static #instance = null;
    #datosActuales = [];
    #suscripcion;

    static getInstance() {
        if (this.#instance === null) {
            this.#instance = new AccelerometerService();
        }
        return this.#instance;
    }
    constructor() {
        console.log(`Instanciando la clase AccelerometerService`);
    }

    start = async () => {
        try {
            Accelerometer.setUpdateInterval(20);
            this.#suscripcion = Accelerometer.addListener(data => {
                this.#datosActuales.push({ ...data, createAt: Date.now() })
            });
        } catch (error) {
            console.log(`Ocurrio un error en la recoleccion de los datos del acelerometro`);
        }
    }
    getDatosActuales = () => {
       
        return [...this.#datosActuales];
    }

    stopAccelerometer = () => {
        if (this.#suscripcion) {
            this.#suscripcion.remove();
            this.#suscripcion = null;
        }
    }

    cleanData = ()=>{
        this.#datosActuales=[];
    }
}