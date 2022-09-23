interface Tileinfo {
    width: number;
    height: number;
}


export class Tilemap {
    tileSettings: Tileinfo = { width: 8, height: 8 };
    file: string;
  
    colorMap: Record<string, HTMLImageElement> = {};
  
    colorToTile(color: string): HTMLImageElement | undefined {
      if (this.colorMap?.[color]) return this.colorMap[color];
      return;
    }
  
    constructor(file: string, tileSettings: Tileinfo = { width: 8, height: 8 }) {
      this.tileSettings = tileSettings;
      this.file = file;
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
  
      img.addEventListener("load", () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const rows = canvas.width / this.tileSettings.width;
        const cols = canvas.height / this.tileSettings.height;
        let num = 0;
  
        ctx.drawImage(img, 0, 0);
  
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            num++;
  
            let imageDataCANVAS = document.createElement("canvas"); // THESE VARIABLE NAMES SUCK
            let imageDataCTX = imageDataCANVAS.getContext("2d")!;
            imageDataCANVAS.width = this.tileSettings.width;
            imageDataCANVAS.height = this.tileSettings.height;
            imageDataCTX.putImageData(
              ctx.getImageData(
                r * this.tileSettings.width,
                c * this.tileSettings.height,
                this.tileSettings.width,
                this.tileSettings.height,
              ),
              0,
              0,
            );
  
            let imageDataImg = new Image();
            imageDataImg.src = imageDataCANVAS.toDataURL();
  
            this.colorMap[num.toString().padStart(6, "0")] = imageDataImg;
          }
        }
      }, false);
  
      img.src = this.file;
    }
  }