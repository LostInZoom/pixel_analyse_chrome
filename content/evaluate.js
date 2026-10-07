
function pixelPowerIndex(r, g, b, model) {

    if(model.equation === "rgb_gamma") {
        const red = Math.pow(r, model.gamma);
        const green = Math.pow(g, model.gamma);
        const blue = Math.pow(b, model.gamma);
          
        return (
            model.coefficients.red * red +
            model.coefficients.green * green +
            model.coefficients.blue * blue
        );
    }
    if (model.equation === "hoarau_hdr") {
        return Math.max(r, g, b);
    }
    if (model.equation === "hoarau_oled") {
        return r + g + b;
    }

    if( model.equation === "rgb_linear") {
        return (
            model.coefficients.red * r +
            model.coefficients.green * g +
            model.coefficients.blue * b
        );
    }
    console.error("Unknown model equation:", model.equation);
    return 0;


}

function analyzePixels(imageData,model){


    const pixels=imageData.data;
    let R=[];
    let G=[];
    let B=[];
    let L=[];

    let totalPowerIndex = 0;

    for(let i=0;i<pixels.length;i+=4){
        let r=pixels[i];
        let g=pixels[i+1];
        let b=pixels[i+2];

        R.push(r);
        G.push(g);
        B.push(b);

        let luminance =0.2126*r + 0.7152*g + 0.0722*b;

        

        L.push(luminance);

        const normalizedR = r / 255;
        const normalizedG = g / 255;
        const normalizedB = b / 255;

        totalPowerIndex += pixelPowerIndex(normalizedR,normalizedG,normalizedB,model);
        
    }
    const pixelCount = R.length;
    const meanRatio = totalPowerIndex / pixelCount;
    let energyResult;
    if (model.output.type === "power") {
        const p_total_ecran = model.coefficients.p_base_watts +meanRatio *(model.coefficients.p_max_watts -model.coefficients.p_base_watts);
        energyResult = {
            type: "power",
            p_total_ecran: p_total_ecran,
            p_pixel: p_total_ecran / pixelCount,
            // mean_ratio: meanRatio,
            model: model.name,
            unit: model.output.unit
        };
    }
    else if (model.output.type === "indicator") {
        energyResult = {
            type: "indicator",
            indicator: meanRatio,
            model: model.name,
            unit: null,
            min: model.output.min,
            max: model.output.max
        };
    }
    return {
        pixelCount: pixelCount,

        rgb: {
            red: {
                mean: average(R),
                std: standardDeviation(R)
            },

            green: {
                mean: average(G),
                std: standardDeviation(G)
            },

            blue: {
                mean: average(B),
                std: standardDeviation(B)
            }
        },

        luminance: {
            mean: average(L),
            std: standardDeviation(L)
        },

        energy: energyResult
    };
}

function average(array){
    return array.reduce((a,b)=>a+b,0)/array.length;
}

function standardDeviation(array){
    const m=average(array);
    const variance=array.map(x=>(x-m)*(x-m)).reduce((a,b)=>a+b,0)/array.length;
    return Math.sqrt(variance);
}
function linearize(v) {

  v /= 255;
  if (v <= 0.04045) {return v / 12.92;}

  return Math.pow((v + 0.055) / 1.055,2.4);

}

