import {
    Chart,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    LineController,

} from 'chart.js';

Chart.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    LineController,
);
export class RenderGraf {
// renderChart Функция для отображения графика
    render(sizes: Number[], times: Number[]) {
        const ctx = document.querySelector('.graf') as HTMLCanvasElement | null;
        if (ctx !== null) {
            new Chart(ctx, {
                type: 'line', 
                data: {
                    labels: times, 
                    datasets: [{
                        data: sizes, 
                        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                        borderColor: ['rgba(255, 99, 132, 1)'],
                        borderWidth: 1,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}
