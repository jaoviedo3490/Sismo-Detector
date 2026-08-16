import AcelerometerService from '../Services/AccelerometerService.js';

export default class AccelerationMagnitudeService {
    static #instance = null;
    static #buffer = [];
    static #bufferPromedio = [];
    static #bufferResultPromedios = [];
    static #processInterval = null;


    constructor() {
        console.log("Instanciando el servicio del calculo de magnitudes");
    }

    static getInstance() {
        if (this.#instance === null) {
            this.#instance = new AccelerationMagnitudeService();
        }
        return this.#instance;
    }
    DataCollector = (data) => {
        try {
            AccelerationMagnitudeService.#buffer.push(...data);
        } catch (error) {
            console.log(`Ocurrio un error al Recoletar los datos: ${error}`)
        }
    }
    ProcessFunctions = () => {
        try {
            if (AccelerationMagnitudeService.#processInterval !== null) {
                return;
            }
            AccelerationMagnitudeService.#processInterval = setInterval(() => {

                if (AccelerationMagnitudeService.#buffer.length === 0) {
                    return;
                }
                this.MagnitudeCalc();
                AccelerationMagnitudeService.#buffer = [];
                AccelerationMagnitudeService.#bufferPromedio = [];
                //AccelerationMagnitudeService.#buffer = [];

            }, 2000);
        } catch (error) {
            console.log(`Ocurrio un error al recolectar los datos del buffer principal: ${error}`);
        }
    }

    MagnitudeCalc = () => {
        try {
            const buffer = AccelerationMagnitudeService.#buffer;
            var magnitudIndividual = 0;
            buffer.forEach(element => {
                magnitudIndividual = (element.x ** 2) + (element.y ** 2) + (element.z ** 2);
                AccelerationMagnitudeService.#bufferPromedio.push(Math.sqrt(magnitudIndividual));
            });
            this.MagnitudeProm();
        } catch (error) {
            console.log(`Ocurrio un error al calcular la magnitud de los ejes: ${error}`);
        }
    }

    MagnitudeProm = () => {
        try {
            const bufferPromedio = AccelerationMagnitudeService.#bufferPromedio;
            if (bufferPromedio.length === 0) {
                console.log("No hay datos suficientes para calcular el promedio");
                return;
            }
            var promedio = 0;

            bufferPromedio.forEach(element => {
                promedio += element;
            });
            promedio /= bufferPromedio.length;
            AccelerationMagnitudeService.#bufferResultPromedios.push(promedio);
            this.AnalizerDesviation();

        } catch (error) {
            console.log(`Ocurrio un error en el calculo del promedio de las magnitudes: ${error}`);
        }
    }

    AnalizerDesviation = () => {
        try {
            const bufferPromedios = AccelerationMagnitudeService.#bufferResultPromedios;
            const ultimoPromedio = bufferPromedios[bufferPromedios.length - 1]
            const desviacion = Math.abs(ultimoPromedio - 1);

            console.log("Promedio:", ultimoPromedio);
            console.log("Desviación respecto a 1g:", desviacion);

        } catch (error) {
            console.log(
                `Ocurrio un error al analizar los promedios: ${error}`
            );
        }
    }
}