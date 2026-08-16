import Svg, { Polyline } from 'react-native-svg';

type AccelerometerData = {
    sismoData: {
        x: number;
        y: number;
        z: number;
        timestamp: number;
    }[];
};

export function AccelerometerGraph({ sismoData }: AccelerometerData) {

    if (!sismoData || sismoData.length === 0) {
        return (
            <Svg width={350} height={200} />
        );
    }

    const puntos = sismoData.map((elemento, index) => {

        const x = sismoData.length === 1
            ? 0
            : (index / (sismoData.length - 1)) * 350;

        const y = 100 - (elemento.x * 30);

        return `${x},${y}`;
    });

    return (
        <Svg width={350} height={200}>
            <Polyline
                points={puntos.join(' ')}
                fill="none"
                stroke="white"
                strokeWidth={3}
            />
        </Svg>
    );
}