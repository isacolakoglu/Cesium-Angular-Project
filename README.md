# Projeyi Çalıştırma 
Projeyi indirip terminale giriyoruz.
1. "npm install" yazarak node_modules paketi indirilecektir.
2. "json-server --watch db.json" yazarak json-server'imizi çalıştırıyoruz.
3. "ng serve -o" yazarak projemizi çalıştırıyoruz.

# Cesium-Angular Kurulumu (Yeni Proje Açmak İçin)
1. "npm install -g @angular/cli" yazarak indiriyoruz.
2. Angular Framework sürümüm günceldir. Eğer güncel değilse "npm install -g @angular/cli@latest" yazarak güncelliyoruz. 
3. "ng new my-app" yazarak Angular'ı kuruyoruz
   * Would you like to add Angular routing? (Yes)
   * Which stylesheet format would you like to use? CSS
4. https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/
   https://cesium.com/learn/cesiumjs-learn/cesiumjs-interactive-building/
   siteye girip incelemek için kılavuza bakabilirsiniz.
5. Projeye girip terminalden "npm install --save cesium" yazarak Cesium kütüphanesini yüklüyoruz.
6. CesiumJS- quickstart dokümanından "Import from CDN" kısmına gelip CesiumJS JavaScript ve CSS Files linkini kopyalayıp projenizin
   "index.html" sayfasına gelip yapıştırıyorsunuz.
   ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/3cd42748-5d68-4d11-8afa-8b8f7609f421)
   
7. "app.component.html" sayfasındaki tüm örnek kodlarını siliyoruz ve ardından şunu yazıyoruz;
   ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/ada3c7c1-9e29-465a-95da-c21c1eb41ddd)

8. "app.component.ts" sayfasında import * as Cesium from 'cesium'; şeklinde kütüphaneyi içe aktarıyoruz.
    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/e3128531-4f09-4b6b-9091-093fb6c07bf4)
    
9. Angular Lifecycle ekleyerek içine şunu yazıyoruz;
   ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/2428c3f6-b474-4c48-b4c5-2b4b00945153)

   * Eğer birden fazla fonksiyon kullanılacaksa basit bir örnekle şunu yapabiliriz;
   ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/7a33887f-5c54-48e1-b4ee-86130c991ffd)

10. "app.component.css" sayfasına gelip şunu ekliyoruz;
    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/330fc88f-ced9-43c6-96aa-2aff874ce0f1)

11. "style.css" sayfasına gelip fullscreen olması için şunu ekliyoruz;
    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/3960662a-b886-419b-b675-66e6d3287c4e)

12. "ng serve -o" yazıp çalıştırıldığında karşımıza şu hata çıkacaktır;
    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/597af925-dd1d-4b79-b08a-4e70d3b41436)

    * Bu hatayı çözmek için;
      - "npm install url"  https://www.npmjs.com/package/url
      - "npm install browserify-zlib" https://www.npmjs.com/package/browserify-zlib
      - "npm install https-browserify" https://www.npmjs.com/package/https-browserify
      - "npm install stream-http" https://www.npmjs.com/package/stream-http

      terminalden indiriyoruz. Kopyalamak için;
      "npm install url browserify-zlib https-browserify stream-http"

13. Empty Module kullanmamız gerekecek dolayısıyla şunu indiriyoruz
    * "npm install --save-dev empty-module" https://www.npmjs.com/package/empty-module?activeTab=dependencies
    * @@@UYARI@@@: empty-module'nun --save-dev olarak indirilmesine dikkat edelim. Yani devDependencies kısmında olmalıdır.

14. "tsconfig.json" dosyasına gelip lib:[] altına şunu ekliyoruz; 

    "paths" : {
      "crypto": ["./node_modules/empty-module"], // crypto-browserify can be polyfilled here if needed
      "stream": ["./node_modules/empty-module"], // stream-browserify can be polyfilled here if needed
      "assert": ["./node_modules/empty-module"], // assert can be polyfilled here if needed
      "http": ["./node_modules/empty-module"], // stream-http can be polyfilled here if needed
      "https": ["./node_modules/empty-module"], // https-browserify can be polyfilled here if needed
      "os": ["./node_modules/empty-module"], // os-browserify can be polyfilled here if needed
      "url": ["./node_modules/empty-module"], // url can be polyfilled here if needed
      "zlib": ["./node_modules/empty-module"], // browserify-zlib can be polyfilled here if needed
      "process": ["./node_modules/process"],
    }

    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/ff9cd019-903e-41dc-9fe2-85675e537750)

15. Tekrar "ng serve -o" şeklinde çalıştıralım

    ![image](https://github.com/isacolakoglu/Cesium-Angular-Project/assets/85408010/47d47604-0866-42d3-a902-a34108ec1bc2)

    

# AirportProject

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
