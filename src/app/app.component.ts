import { Component, ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { TransformationContext } from 'typescript';

class Tabla {
  cuota: number;
  pago: number; 
  fecini: Date; 
  fecfin: Date; 
  dias: number; 
  valor: number; 
  capital: number; 
  interes: number; 
  saldo: number;
  intacu: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  

  title = 'amortizacion'; 
  public registro : Tabla[] = [];
  public calculado = 0;
  public monto : number = 80000;
  public tasa : number = 12.50;
  public basecal : number = 360;
  public tipocal : number = 360;
  public cuota: number = 0;
  public cuotas: number = 60;
  public fecini : Date = new Date();

  @ViewChild('pdfTable') pdfTable: ElementRef;
  

  ngOnInit() {

  }

  public downloadAsPDF() {
    const doc = new jsPDF();
   
    const pdfTable = this.pdfTable.nativeElement;
   
    var html = htmlToPdfmake(pdfTable.innerHTML);
    // const document2 = { styles: 'bg-info: {background-color: red }, h2: {color: red}'};
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).open(); 

  }

  calCuotas() {
    let desembolso = new Date(this.fecini);
    desembolso.setTime(desembolso.getTime() + desembolso.getTimezoneOffset()*60*1000);
    let r = this.tasa / 100;
    this.cuota = Math.round((this.monto * r / 12 ) / (1 - Math.pow(1 + (r / 12),this.cuotas * -1)) * 100) / 100;


    let saldo = this.monto;
    let j : number = 0;
    let fec = desembolso;
    let intpend: number = 0;
    for (let i = 0; i < this.cuotas; i++ ) {
      let reg = new Tabla();   
      let pag = new Tabla();   
      reg.cuota = i + 1;
      // reg.pago = 0;
 
      reg.fecini = new Date(fec);
      let fec2 = fec.setMonth(fec.getMonth()+1);
      reg.fecfin = new Date(fec2);
      if (this.tipocal == 360) {
        reg.dias = 30;
      } else {
        let diffdias = reg.fecfin.getTime() - reg.fecini.getTime();
        reg.dias = Math.round(diffdias/(1000*60*60*24));
      }
      reg.valor = this.cuota;
      reg.saldo = saldo; 
      reg.interes = Math.round((saldo*(r*reg.dias)/this.basecal)*100) / 100;
      reg.capital = Math.round((this.cuota - reg.interes) * 100) / 100;
      reg.intacu = reg.interes + intpend;
      this.registro[j] = reg;
      j++;
      // pag.fecini = 0;
      pag.pago = reg.cuota;
      pag.fecfin = reg.fecfin;
      pag.valor = reg.valor;
      pag.interes = reg.interes * -1;
      if (reg.capital > saldo) {
        pag.capital = saldo;
        saldo = 0;
      } else {
        pag.capital = reg.capital * -1;
        saldo = Math.round((saldo - reg.capital)*100) / 100;
      }
      pag.saldo = saldo;
      pag.intacu = reg.intacu + pag.interes; 
      this.registro[j] = pag;
      j++;
      intpend = pag.intacu;
    }

    // nose[0] = reg;

    this.calculado = 1;
  }


  amortizar() {
    alert("Amortización en construcción");
  }

  show(j: number) {
    alert(JSON.stringify(this.registro[j]));
  }

}