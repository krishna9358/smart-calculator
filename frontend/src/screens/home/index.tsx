import { useEffect, useRef, useState } from "react"
import { SWATCHES } from "@/constants"
import { ColorSwatch, Group } from "@mantine/core"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface Response{
    expression: string;
    result: string;
    assigned: string;
}

interface GeneratedResult{
    expression: string;
    result: string;
}

export default function Home() {
    const canvaRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [dicOfVars, setDicOfVars] = useState({});
    useEffect(() => {
        if (reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);
    
    const resetCanvas = () => {
        const canvas = canvaRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    useEffect(() => {
        const canvas = canvaRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 50;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }
    }, []);
    
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvaRef.current; 
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false);
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvaRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    }

    const sendData = async () => {
        const canvas = canvaRef.current;
        if (canvas) {
            const imageData = canvas.toDataURL('image/png');
            const response = await axios.post<Response>(process.env.VITE_API_URL + '/calculate', {
                data : {
                     image: imageData,
                     dicOfVars: dicOfVars,
                },
            });
            setResult(response.data);
            const respns = await response.data;
            console.log('Response : ', respns);
        }
    }
    
    return (
        <main>
            <section className="grid grid-cols-12 gap-3item-center">
                <Button onClick={() => setReset(true)} className="z-20 bg-black text-white col-span-2" variant='default' color="black">
                    Reset
                </Button>
                <Group className="z-20 bg-black col-span-5 items-center justify-center  ">
                    {SWATCHES.map((swatch : string) => (
                        <ColorSwatch  key={swatch} color={swatch} onClick={() => setColor(swatch)} />
                    ))}
                </Group>
                
                <Button onClick={sendData} className="z-20 bg-black text-white col-span-2" variant='default' color="black">
                    Calculate
                </Button>
            </section>
            <canvas ref={canvaRef} id='canvas' className="absolute top-0 left-0 w-full h-full" 
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
            />
        </main>
    )
}

