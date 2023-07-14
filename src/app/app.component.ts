import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import * as Cesium from 'cesium';
import { Entity } from 'cesium';
import { BillboardsService } from './services/billboards.service';
import { billboardsData } from './models/billboards.model';
import { waysData } from './models/ways-location.model';

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NWM2NDRjNC1mM2E3LTRiYjEtYmZkMS0wNzhlYjU5NjY5N2UiLCJpZCI6MTQ2MjY2LCJpYXQiOjE2ODg1NDcwMjR9.TFin0fP7qjPXiLd1AhZ3EctRzhC3WmGiWw48emmMvRA"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app.component.scss', '../styles.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('cesiumContainer', { static: true }) cesiumContainer: ElementRef | undefined;
  title = 'airport-project';
  sceneModePicker: any;
  viewer: any;
  airportData: billboardsData[] | any; //Ana eleman olan Airport için veriler
  blocksairportData: billboardsData[] | any; //Airport'un alt elemanları olan A,B,C blokları için veriler  
  militaryData: billboardsData[] | any; //Military Base için tanımlanan veriler.
  civilianData: billboardsData[] | any; //Civilian Home için tanımlanan veriler
  enemiesData: billboardsData[] | any; //Denied Area için tanımlanan veriler
  waysData: waysData[] | any; //Vehicle yani aracın gideceği belli konumlarla oluşturulmuş polyline verisi.
  airportPoint: any; //Airport için materyaller oluşturmak için tanımlandı. 
  polygonAirport: any; //Airport'un polygonu için 


  blocksAirportPoint: any; //A,B,C Blok için entities.add içine çağırmak için tanımlandı.
  private dataEntities: any[] = []; //A,B,C Blok Billboard ve Label'i gizlemek amacıyla push yapmak için tanımlandı.


  private handler: any;
  private isDrawing: boolean | any;
  private billboards: Cesium.Entity[] | any;
  private polylines: any[];
  private totalDistance: number;
  private polygon: any;

  constructor(private billboardsService: BillboardsService, private renderer: Renderer2) {
    this.isDrawing = false;
    this.billboards = [];
    this.polylines = [];
    this.totalDistance = 0;
    this.polygon = null;
    //this.polygonAirport = null;
  }
  async Cesium() {
    this.viewer = new Cesium.Viewer("cesiumContainer", {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      timeline: true,
      animation: true,
      homeButton: true,
      navigationHelpButton: true,
      baseLayerPicker: true,
      geocoder: true,
      sceneModePicker: this.sceneModePicker,
      sceneMode: Cesium.SceneMode.SCENE3D
    })
    this.viewer.scene.globe.enableLighting = true;
  }
  ngOnInit(): void {
    this.Cesium();
    this.mouseover();
    this.airportPoints();
    this.militaryPoints();
    this.civilianPoints();
    this.enemiesPoints();
    this.setDefaultCursorStyle();
  }


  ngAfterViewInit(): void {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    //this.handler.setInputAction((click: any) => this.onRightClick(click), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  toggleDrawing() {
    this.isDrawing = !this.isDrawing;

    if (this.isDrawing) {
      this.setDrawingCursorStyle();
      this.handler.setInputAction((click: any) => this.onLeftClick(click), Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    else {
      this.setDefaultCursorStyle();
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
  }
  setDefaultCursorStyle() {
    this.renderer.setStyle(document.body, 'cursor', 'default');
  }
  setDrawingCursorStyle() {
    this.renderer.setStyle(document.body, 'cursor', 'crosshair');
  }


  onLeftClick(click: any) {
    const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);


    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      // Create a billboard at the clicked position
      const billboard = this.viewer.entities.add({
        position: cartesian,
        billboard: {
          image: '../assets/location-pin-svgrepo-com.png',
          width: 32,
          height: 32
        }
      });
      this.billboards.push(billboard)

      if (this.billboards.length > 1) {
        const lastIndex = this.billboards.length - 1;
        const point1 = this.billboards[lastIndex - 1].position.getValue(this.viewer.clock.currentTime);
        const point2 = this.billboards[lastIndex].position.getValue(this.viewer.clock.currentTime);
        const distance = Cesium.Cartesian3.distance(point1, point2) / 1000; // distance in kilometers

        // Update the total distance
        this.totalDistance += distance;
        console.log(`Pointler arasındaki uzaklık: ${distance} km`)
        console.log(`İlk ve son nokta arasındaki uzaklık: ${this.totalDistance} km`)
        // Add a polyline between the two points
        const positions = [point1, point2];
        const material = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED
        });
        const polyline = this.viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => positions, false),
            width: 2,
            material: material
          }
        });
        this.polylines.push(polyline);
      }
    }
  }

  /*
  onRightClick(click: any) {
    if (this.billboards.length < 3) {
      return;
    }

    const firstPoint = this.billboards[0].position.getValue(this.viewer.clock.currentTime);
    const lastPoint = this.billboards[this.billboards.length - 1].position.getValue(this.viewer.clock.currentTime);

    const positions = [firstPoint, lastPoint];
    const material = new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.RED
    });
    
    const polyline = this.viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => positions, false),
        width: 2,
        material: material
      }
    });

    this.polylines.push(polyline);

    

    const distance = Cesium.Cartesian3.distance(firstPoint, lastPoint) / 1000; 

    this.totalDistance += distance;
    const hierarchy = new Cesium.PolygonHierarchy(positions);
    const polygon = this.viewer.entities.add({
      polygon: {
        hierarchy: hierarchy,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE),
        fill: true
      }
    });
    this.polygon = polygon;
    console.log(`Toplam uzunluk: ${this.totalDistance} km`)
  }
  */
  async vehicleTracking() {
    const trackData = this.billboardsService.getWaysBillboards().subscribe((data: waysData[]) => {
      this.waysData = data;
    })
    const vehicleUri = await Cesium.IonResource.fromAssetId(1872999);
    const timeStepInSeconds = 30;
    const totalSeconds = timeStepInSeconds * (this.waysData.length - 1);
    const start = Cesium.JulianDate.fromIso8601("2023-07-12T18:00:00Z");
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
    this.viewer.clock.startTime = start.clone();
    this.viewer.clock.stopTime = stop.clone();
    this.viewer.clock.currentTime = start.clone();
    this.viewer.timeline.zoomTo(start, stop);
    this.viewer.clock.multiplier = 25;
    // Start playing the scene.
    this.viewer.clock.shouldAnimate = true;

    const positionProperty = new Cesium.SampledPositionProperty();

    for (let i = 0; i < this.waysData.length; i++) {

      const dataPoint = this.waysData[i];

      const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
      const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, -21);
      positionProperty.addSample(time, position);

      const pointEntity = this.viewer.entities.add({
        description: `Points at (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.altitude})`,
        position: position,
      })
      const vehicleEntity = this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: start, stop: stop })]),
        position: positionProperty,
        color: Cesium.Color.YELLOW,
        polyline: {
          positions: positionProperty,
          width: 5,
          color: Cesium.Color.YELLOW,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          glowPower: 0.2
        },
        // Attach the 3D model instead of the green point.
        model: { uri: vehicleUri, minimumPixelSize: 32, maximumScale: 32, scale: 0.000001 },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 5 })
      });

      //this.viewer.trackedEntity = vehicleEntity;
      var flyToLocation = Cesium.Cartesian3.fromDegrees(-75.867561293, 43.7717612946, 20)
      if (i === this.waysData.length - 1) {
        vehicleEntity.availability = new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: start, stop: start })])
      }
      if (i === 0) {
        this.viewer.flyTo(vehicleEntity, {
          offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 2000),
          duration: 1.0
        })
      }

    }




  }

  async airportPoints() {
    this.billboardsService.getAirportBillboard().subscribe((data: billboardsData[]) => {
      this.airportData = data
      for (let i = 0; i < this.airportData.length; i++) {

        //2.ADIM
        var polygon = Cesium.Cartesian3.fromDegreesArray([
          this.airportData[i].firstPointX, this.airportData[i].firstPointY,
          this.airportData[i].secondPointX, this.airportData[i].secondPointY,
          this.airportData[i].thirdPointX, this.airportData[i].thirdPointY,
          this.airportData[i].fourthPointX, this.airportData[i].fourthPointY,
          this.airportData[i].fifthPointX, this.airportData[i].fifthPointY,
          this.airportData[i].sixthPointX, this.airportData[i].sixthPointY,
          this.airportData[i].seventhPointX, this.airportData[i].seventhPointY
        ])
        var bs = Cesium.BoundingSphere.fromPoints(polygon);
        var center = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(bs.center);
        //2.ADIM


        this.airportPoint = this.viewer.entities.add({
          id: this.airportData[i].id,
          name: this.airportData[i].name,
          position: center, //2.ADIM
          /*
          polygon: {
            hierarchy: polygon,
            material: Cesium.Color.BLUE.withAlpha(0.5),
            outline: true,
            outlineWidth: 10.0,
            outlineColor: Cesium.Color.BLUE,
            fill: false,
            //extrudedHeight: 50
          },
          */
          billboard: {
            image: this.airportData[i].image,
            width: this.airportData[i].width,
            height: this.airportData[i].altitude,
            position: center,
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          label: {
            text: this.airportData[i].text,
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffSet: new Cesium.Cartesian2(0, -9),
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          description: '<div style="justify-content: center; text-align:center;"><img src="../assets/AirportPhoto.jpg" style="width:300px; height:300px;"></div>' +
            this.airportData[i].description
        })
        this.polygonAirport = this.viewer.entities.add({
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              this.airportData[i].firstPointX, this.airportData[i].firstPointY,
              this.airportData[i].secondPointX, this.airportData[i].secondPointY,
              this.airportData[i].thirdPointX, this.airportData[i].thirdPointY,
              this.airportData[i].fourthPointX, this.airportData[i].fourthPointY,
              this.airportData[i].fifthPointX, this.airportData[i].fifthPointY,
              this.airportData[i].sixthPointX, this.airportData[i].sixthPointY,
              this.airportData[i].seventhPointX, this.airportData[i].seventhPointY
            ]),
            material: Cesium.Color.BLUE.withAlpha(0.5),
            outline: true,
            outlineWidth: 10.0,
            outlineColor: Cesium.Color.BLUE,
            fill: false,
            //extrudedHeight: 50
          },
        })
        const airportButton = document.getElementById('airport');
        airportButton?.addEventListener('click', () => {
          this.viewer.zoomTo(this.polygonAirport)
        })
      }

    })

    this.billboardsService.getBlocksBillboards().subscribe((blocksofData: billboardsData[]) => {
      this.blocksairportData = blocksofData
      for (let i = 0; i < this.blocksairportData.length; i++) {
        this.blocksAirportPoint = this.viewer.entities.add({
          name: this.blocksairportData[i].name,
          position: Cesium.Cartesian3.fromDegrees(this.blocksairportData[i].longitude, this.blocksairportData[i].latitude, this.blocksairportData[i].altitude),
          billboard: {
            image: this.blocksairportData[i].image,
            width: this.blocksairportData[i].width,
            height: this.blocksairportData[i].altitude,
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          label: {
            text: this.blocksairportData[i].text,
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffSet: new Cesium.Cartesian2(0, -9),
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          }
        })
        this.dataEntities.push(this.blocksAirportPoint)
      }
      this.viewer.camera.changed.addEventListener(() => {
        const distance = this.viewer.camera.positionCartographic.height;
        console.log(distance, 'distance')
        for (const entity of this.dataEntities) {
          if (distance > 10000) {
            entity.billboard.show = false;
            entity.label.show = false;
          }
          else {
            entity.billboard.show = true;
            entity.label.show = true;
          }
        }
      })
    });
  }

  async militaryPoints() {
    this.billboardsService.getMilitaryBillboards().subscribe((militaryData: billboardsData[]) => {
      this.militaryData = militaryData;
      for (let i = 0; i < this.militaryData.length; i++) {
        const militaryPoint = this.viewer.entities.add({
          name: this.militaryData[i].name,
          position: Cesium.Cartesian3.fromDegrees(this.militaryData[i].longitude, this.militaryData[i].latitude, this.militaryData[i].altitude),
          billboard: {
            image: this.militaryData[i].image,
            width: this.militaryData[i].width,
            height: this.militaryData[i].height,
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          label: {
            text: this.militaryData[i].text,
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffSet: new Cesium.Cartesian2(0, -9),
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              this.militaryData[i].firstPointX, this.militaryData[i].firstPointY,
              this.militaryData[i].secondPointX, this.militaryData[i].secondPointY,
              this.militaryData[i].thirdPointX, this.militaryData[i].thirdPointY,
              this.militaryData[i].fourthPointX, this.militaryData[i].fourthPointY,
              this.militaryData[i].fifthPointX, this.militaryData[i].fifthPointY,
            ]),
            height: 0,
            material: Cesium.Color.GREEN.withAlpha(0.5),
            outline: true,
            outlineWidth: 20,
            outlineColor: Cesium.Color.BLACK
          }
        })
        const militaryButton = document.getElementById('military');
        militaryButton?.addEventListener('click', () => {
          this.viewer.zoomTo(militaryPoint)
        })
      }
    })
  }

  async civilianPoints() {
    this.billboardsService.getCivilianBillboards().subscribe((civilianData: billboardsData[]) => {
      this.civilianData = civilianData;
      for (let i = 0; i < this.civilianData.length; i++) {
        const civilianPoint = this.viewer.entities.add({
          name: this.civilianData[i].name,
          position: Cesium.Cartesian3.fromDegrees(this.civilianData[i].longitude, this.civilianData[i].latitude, this.civilianData[i].altitude),
          billboard: {
            image: this.civilianData[i].image,
            width: this.civilianData[i].width,
            height: this.civilianData[i].height,
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          label: {
            text: this.civilianData[i].text,
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffSet: new Cesium.Cartesian2(0, -9),
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              this.civilianData[i].firstPointX, this.civilianData[i].firstPointY,
              this.civilianData[i].secondPointX, this.civilianData[i].secondPointY,
              this.civilianData[i].thirdPointX, this.civilianData[i].thirdPointY,
              this.civilianData[i].fourthPointX, this.civilianData[i].fourthPointY,

            ]),
            height: 0,
            material: Cesium.Color.YELLOW.withAlpha(0.5),
            outline: true,
            outlineWidth: 20,
            outlineColor: Cesium.Color.BLACK
          }
        })
        const civilianButton = document.getElementById('civilian');
        civilianButton?.addEventListener('click', () => {
          this.viewer.zoomTo(civilianPoint)
        })
      }
    })
  }

  async enemiesPoints() {
    this.billboardsService.getEnemiesBillboards().subscribe((enemiesData: billboardsData[]) => {
      this.enemiesData = enemiesData;
      for (let i = 0; i < this.enemiesData.length; i++) {
        const enemiesPoint = this.viewer.entities.add({
          name: this.enemiesData[i].name,
          position: Cesium.Cartesian3.fromDegrees(this.enemiesData[i].longitude, this.enemiesData[i].latitude, this.enemiesData[i].altitude),
          billboard: {
            image: this.enemiesData[i].image,
            width: this.enemiesData[i].width,
            height: this.enemiesData[i].height,
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          label: {
            text: this.enemiesData[i].text,
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffSet: new Cesium.Cartesian2(0, -9),
            scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.2)
          },
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              this.enemiesData[i].firstPointX, this.enemiesData[i].firstPointY,
              this.enemiesData[i].secondPointX, this.enemiesData[i].secondPointY,
              this.enemiesData[i].thirdPointX, this.enemiesData[i].thirdPointY,
              this.enemiesData[i].fourthPointX, this.enemiesData[i].fourthPointY,
            ]),
            height: 0,
            material: Cesium.Color.RED.withAlpha(0.5),
            outline: true,
            outlineWidth: 20,
            outlineColor: Cesium.Color.BLACK
          }
        })
        const enemiesButton = document.getElementById('enemies');
        enemiesButton?.addEventListener('click', () => {
          this.viewer.zoomTo(enemiesPoint)
        })
      }
    })
  }

  async mouseover() {
    const viewer = this.viewer
    const airportSet = await Cesium.Cesium3DTileset.fromIonAssetId(1941882, { backFaceCulling: true })
    const airport = await this.viewer.scene.primitives.add(airportSet)
    this.viewer.flyTo(airport)

    var entity = this.viewer.entities.add({
      id: 'mousemoveLabel',
      label: {
        show: false,
      }
    });
    var mouseLabelCb = function (e: MouseEvent) {
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(e.clientX, e.clientY), ellipsoid);
      let position;
      let labelshow;
      let labeltext;
      position = entity.position
      labelshow = entity.label?.show
      labeltext = entity.label?.text
      if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(10);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(10);
        position = cartesian;
        labelshow = true;
        labeltext = '(' + longitudeString + ', ' + latitudeString + ')';
        //console.log('Labeltext', labeltext)
      }
      else {
        labelshow = false;
      }
    };
    this.viewer.scene.canvas.addEventListener('mousemove', mouseLabelCb);
    this.viewer.scene.canvas.addEventListener('wheel', mouseLabelCb)
  }


}





/*
const polygon = new Cesium.PolygonGeometry({
  polygonHierarchy: new Cesium.PolygonHierarchy(
    Cesium.Cartesian3.fromDegreesArray([
      this.airportData[i].firstPointX, this.airportData[i].firstPointY,
      this.airportData[i].secondPointX, this.airportData[i].secondPointY,
      this.airportData[i].thirdPointX, this.airportData[i].thirdPointY,
      this.airportData[i].fourthPointX, this.airportData[i].fourthPointY,
      this.airportData[i].fifthPointX, this.airportData[i].fifthPointY,
      this.airportData[i].sixthPointX, this.airportData[i].sixthPointY,
      this.airportData[i].seventhPointX, this.airportData[i].seventhPointY
    ])
  )
});
*/



//const geometry = Cesium.PolygonGeometry.createGeometry(polygon);





/*
if (this.billboards.length === 2) {
  console.log(this.billboards);

  const point1 = this.billboards[0].position.getValue(this.viewer.clock.currentTime);
  const point2 = this.billboards[1].position.getValue(this.viewer.clock.currentTime);

  const distance = Cesium.Cartesian3.distance(point1, point2);

  const distanceInMeters = distance.toFixed(2);
  const distanceInKilometers = (distance / 1000).toFixed(2);

  console.log('Distance in meters: ', distanceInMeters);
  console.log('Distance in kilometers: ', distanceInKilometers);

  const positions = [point1, point2];
  const material = new Cesium.PolylineDashMaterialProperty({
    color: Cesium.Color.RED
  })
  this.polyline = this.viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => positions, false),
      width: 2,
      material: material
    }
  })

  this.isDrawing = false;
  this.billboards.forEach((billboard:any) => {
    this.viewer.entities.remove(billboard);
  });
  //this.viewer.entities.remove(this.polyline)
  this.billboards = [];
  //this.polyline = null;
}
*/


/*
    if (cartesian) 
    {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      if(this.billboards.length === 0) {
        //İlk point olarak position tıklandığında 1 billboard oluşturma
        const billboard = this.viewer.entities.add({
          position: cartesian,
          billboard: {
            image: '../assets/location-pin-svgrepo-com.png',
            width: 16,
            height: 16
          }
        });
        this.billboards.push(billboard);
      }
      else if (this.billboards.length === 1) {
        const billboard = this.viewer.entities.add({
          position: cartesian,
          billboard: {
            image: '../assets/location-pin-svgrepo-com.png',
            width: 16,
            height: 16
          }
        });
        this.billboards.push(billboard);

        const point1 = this.billboards[0].position.getValue(this.viewer.clock.currentTime)
        const point2 = this.billboards[1].position.getValue(this.viewer.clock.currentTime)
        const distance = Cesium.Cartesian3.distance(point1, point2) / 1000;

        //Update the total distance
        this.totalDistance += distance;

        //İki point arasında 1 polyline ekleme
        const positions = [point1, point2];
        const material = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW
        });
        const polyline = this.viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => positions, false),
            width: 2,
            material: material
          }
        });
        this.polylines.push(polyline);
      }
      else {
        //Tıklanan pozisyonda 1 billboard oluşturma
        const billboard = this.viewer.entities.add({
          position: cartesian,
          billboard: {
            image: '../assets/location-pin-svgrepo-com.png',
            width: 16,
            height: 16
          }
        });
        this.billboards.push(billboard);

        //Yeni nokta ile önceki nokta arasındaki mesafeyi hesaplama
        const lastIndex = this.billboards.length - 1;
        const point1 = this.billboards[lastIndex - 1].position.getValue(this.viewer.clock.currentTime)
        const point2 = this.billboards[lastIndex].position.getValue(this.viewer.clock.currentTime)
        const distance = Cesium.Cartesian3.distance(point1, point2) / 1000; //Kilometre cinsinden uzaklık

        // Toplam uzaklığı güncelleme
        this.totalDistance += distance;
        console.log('Toplam uzunluk', this.totalDistance)

        const positions = [point1, point2];
        const material = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW
        });
        const polyline = this.viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => positions, false),
            width: 2,
            material: material
          }
        });
        this.polylines.push(polyline);

        //Eğer tekrar ilk point'e tıklanırsa birleştirme durumu
        if(lastIndex === this.billboards.length - 1 && lastIndex > 1) {
          //İlk ve son nokta bağlanarak polygon oluşturma
          const firstPoint = this.billboards[0].position.getValue(this.viewer.clock.currentTime);
          const lastPoint = this.billboards[lastIndex].position.getValue(this.viewer.clock.currentTime);

          //İlk ve son nokta arasında polyline ekleme
          const polygonPositions = [firstPoint, ...positions, lastPoint];
          const polygon = this.viewer.entities.add({
            polygon: {
              hierarchy: polygonPositions,
              material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.5))
            }
          });
          this.polygon = polygon;
        }
      }
      */

/*
const billboard = this.viewer.entities.add({
  position: cartesian,
  billboard: {
    image: '../assets/location-pin-svgrepo-com.png',
    width: 16,
    height: 16
  }
});
this.billboards.push(billboard)

if(this.billboards.length > 1) {
  const point1 = this.billboards[this.billboards.length -2].position.getValue(this.viewer.clock.currentTime);
  const point2 = this.billboards[this.billboards.length -1].position.getValue(this.viewer.clock.currentTime);

  const distance = Cesium.Cartesian3.distance(point1, point2);
  const distanceInMeters = distance.toFixed(2);
  const distanceInKilometers = (distance / 1000).toFixed(2);
  console.log('İki point arasında metre cinsinden uzunluk: ', distanceInMeters);
  console.log('İki point arasında kilometre cinsinden uzunluk: ', distanceInKilometers);


  
  const totalDistance = Cesium.Cartesian3.distance(point1, point2) / 1000;  //Kilometre cinsinden uzunluk
  const totaldistanceInKilometers = (totalDistance / 1000).toFixed(2); //Toplam kilometre cinsinden uzunluk
  this.totalDistance += distance; //Point ekledikçe uzunlukların toplam uzunluğu
  console.log('Tüm pointlerin kilometre cinsinden toplam uzunluk:', this.totalDistance);


  const positions = [point1, point2];
  const material = new Cesium.PolylineDashMaterialProperty({
    color: Cesium.Color.YELLOW
    
  });
  const polyline = this.viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => positions, false),
      width: 2,
      material: material
    }
  });
  this.polylines.push(polyline);
}
*/