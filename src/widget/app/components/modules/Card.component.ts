import {Component, Inject, Input, Output, SimpleChanges, EventEmitter, OnInit, AfterViewInit, ElementRef, ViewChild} from "@angular/core";
import {MaxLengthValidator} from "@angular/forms";
import {StripeService} from "../../service/Stripe.service";
import {UtilService} from "../../service/Util.service";
import { TranslationService } from '../../service/Translation.service';

declare var jQuery: any;
@Component({
  selector: "card",
  template: require("raw-loader!./Card.html")
})

export class CardComponent implements OnInit {
  @ViewChild('cardNumber') cardNumber;
  @ViewChild('cardExpiry') cardExpiry;
  @ViewChild('cardCvc') cardCvc;

  @Input() cardObj: Object;
  @Input() stripeElement: any;
  @Input() isSubmitting: Boolean;
  @Output() error: EventEmitter<any> = new EventEmitter<any>();
  hasError: Boolean = true;
  
  constructor(private stripeService: StripeService,  @Inject(TranslationService) private translationService: TranslationService) {
    this.translationService.setupTranslation("campaign_card");
  }
  ngOnChanges(changes: SimpleChanges) {
    let widget = this;
    if(changes.isSubmitting && changes.isSubmitting.currentValue) {
      if(widget.hasError) {
        var displayError = document.getElementById('card-errors');
        if(displayError) {
          displayError.textContent = 'You have entered an invalid credit card';
          widget.error.emit(widget.hasError);
        }
      }
    }
  }

  ngOnInit() {
    jQuery("input.cardNumber, input.cardExpiry, input.cardCVC").payment("restrictNumeric");
    jQuery("input.cardExpiry").payment("formatCardExpiry");
    jQuery("input.cardCVC").payment("formatCardCVC");
  }

  ngAfterViewInit() {
    if(this.stripeElement.toggle) {
      this.initStripeElement();  
    }    
  }

  initStripeElement() {
    let widget = this;
    try {

      var cardBrandToPfClass = {
        'visa': 'pf-visa',
        'mastercard': 'pf-mastercard',
        'amex': 'pf-american-express',
        'discover': 'pf-discover',
        'diners': 'pf-diners',
        'jcb': 'pf-jcb',
        'unknown': 'pf-credit-card',
      }
      // if(this.stripeElement.getCard('cardNumber') == null) {
        // Add an instance of the card Element into the `card-element` <div>
        this.stripeElement.createCard('cardNumber', 'Credit Card Number');
        this.stripeElement.getCard('cardNumber').mount(this.cardNumber.nativeElement);
        this.stripeElement.createCard('cardExpiry', 'MM/YY');
        this.stripeElement.getCard('cardExpiry').mount(this.cardExpiry.nativeElement);
        this.stripeElement.createCard('cardCvc', 'CVC');
        this.stripeElement.getCard('cardCvc').mount(this.cardCvc.nativeElement);

        this.stripeElement.getCard('cardNumber').addEventListener('change', function(event) {
          var displayError = document.getElementById('card-errors');
          if (event.error) {
            displayError.textContent = event.error.message;
            widget.hasError = true;
            widget.error.emit(widget.hasError);
          } else {
            displayError.textContent = '';
            widget.hasError = false;
            widget.error.emit(widget.hasError);
          }
          // Switch brand logo
          if (event.brand) {
            widget.setBrandIcon(event.brand, cardBrandToPfClass);
          }
        });
      // }
    } catch(error) {
      console.error(error);
    }
  }
  
  setBrandIcon(brand, cardBrandToPfClass) {
    var brandIconElement = document.getElementById('brand-icon');
    var pfClass = 'pf-credit-card';
    if (brand in cardBrandToPfClass) {
      pfClass = cardBrandToPfClass[brand];
      switch (brand) {
        case "visa":
          jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwQ0IXda5QAAAvNJREFUWMPtll2IjFEcxn/zzqeZ3R0zO4u1g12zVrIktIhNIm4UiVyQfCREbBLJhYgkN4oLKSStFOVC2ZbCZvPRUutrGGbFsqbBsrPzPfu+57h412ykLOvCMs/V6fS+nd95/s9TxzByyxNJP5BCP1EONAf6t8sgpcy1/r8ENf1w97jhx1+bC2BVpB846hwFQDSl4avx46vxk0gLdpxtw1fjp6klDkC6S1Db+In5h1qYvCvA1jNtCNFThetPoozZ9hRfjZ+OuNYHR8esg0wnGG1E3j3GGWvS9weOBuCGPwbAwslO7FaFmwEdsMRtQdUks/cHCXWolBZZKHGZufqoE0UpAUAIyebTb8moOvjL92kmltl/E7T6WHYp4iqrD5zg5PD1SIcXA3C47gMAm+Z60IQkHFEBKMwz4m9LEepQmVpup3ZTaRbuqx60JklkJOWDLQTDGe69TPQK9KejdzlM3O+ayerWY6SsI/gYVXn1IcNQl5myQVaiSaHH1whWs4LTbgTgTjDBqYZ2NCFRlJ7MH7z0HoAjK70A1D+M/rmMLqpy0hCr5o1jDnXNnQDsXDAYgFBHFwBVPgcAIzwW9i4eAsC+i2Gq97wgltJz2B5TaWpJML3CQUWxjTyrQvPr5DeO9wl03vgCABreuDlSr499dmUeAMFwuhu0Z3zLZrhp2lfBuGE2whE1G5Xaxs8AzJ9YQDIjmFA6AIBPvShUr0DHem3ZsbXHNJbPcGE16b8+eJ0EoHKYDSlltiTuPBNrZhUCEE8LVE1y9IoOvPNciMrtz2jsLmFL92V/vUzfKX+AEaddIZLQ87i2GwDg1nP9sLJBViIJwaRdASq9NoQEf1sKgA1zPNx+EUcTuvNLpw0EIPAuzfFr7dwNJphS7ug7qA7n4dztzxS7zHgLLQBIKYmnBV63maJ8E0JKFlc5uRmIo2qSFdUuNs4twpNvYveFEF63mb1Lihk1xApAKiO43NzJw9Zk7lGSA/0HXk/nDTlHc6A50D+gL+loLFjxf8xyAAAAAElFTkSuQmCC')");
          break;
        case "mastercard":
          jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwsjJTzD7QAABH5JREFUWMPtmG1sU2UUx3/3tr3d7Vq6rttoN8eG4IARcCIMRtyCAx1OQDCBGEIkBP1AglkCiDGKLqAJMYAZQtDxQRc+QTSEYAjyIgQNaTZgc7xsbBM2unWvbSlbX9a1vX7gTaKMC8OkJJ7kfrg3J8/95Tzn/M95HkFRFOW04yK79/1MR5ebeLL0tGTWrlzInFlTEE47Lioff/UD8WzbP3kPzYCUWd4/EIxr0MvNbYjxtt3/Zh1dbkSeEXtmQLWP5a0oZIb8FLq7yb/ZS2o4RLde5rzZyhmrDWdCIgjCXWfy7D0sntjMi9YuzNogvohMvWc0BxtyqOtMAwTVvxYK3l6vqHG0hAfZ2niOjFDgoT7OBAObJryMnBamsuQIZu3Di9QXkfngZAktbsvTA80Z8LHtSrWqPBFHhTGV9aCxqovUZ9WvcqIle+Q5ag2HVEMK+igJ03sYOgsxlYq3Of8UOSmeEYIqClsaL6iuOP3UvntpF6lWn/oVxceA2JODZgX9jAn51eWQMYw4aujee+zW7UeNmbVBZo3pUg+q0Yjs3ryGovzJmIwy279ci6503jB0AtKS0tvyYfvnXsfaAVGCl7bDwmswaeNDl1o6qREAg6ynvGz58PKUYhlFZnoqYzNtZNhSsCSbGXJ7MO79GjHdhnLTh//Dckw/fU/M6SK4tYLEbZuJub0krJiJmD0evJ0MVW1Av+Mi0WPbYFYh3NgPtRtA0MCMPWDKgaF+qH4fik9C8x6mTUjiyDtrqG+8jqvbPXxEx2fZOXTMQYbNSprVjE6AaFs7wZ2VhCqr0BUVoJ2RR6zVycDqMpAkghXfobi9aKbOJvLjF4jTShFfyEfp7yVych/YX4eOw4ACSgSadsHVnZBWCElTIdQJ3lr0aTMoXfU5oVCY2svXhgfNmzyO85daWFCcz4nf69BmZSK9Ngfd3CKibR1Em/4kfOgowR17SKo5ju6VmUQu1COYjMTaGlA8LsKbiiDRQvR4JYIwAEoMpOQ7c9sCSH8T/K3gbwPZDs3fgkbP0K1WBEFgXLadlrbO4UFzx2fS0uqi+o8mXD0e2s5UE6mpRZpfjH7ZIgYP/4Jp/14M5RsJbK0g2u7CuGMLkUsNKGEJ6aODiLOXIabnELt6Fk2qAqffuL298+sg1AXPvQXZy+HGATDngvcC9DkIGKawZf0KZL1En8f3eII/NtDPN5cc6qreMIRc0P3AN6kIRLO6yl/3WwkOZ/qTydN12UhHgkHdGBDQERvQ3V/YpB5yIKrH4bSNQPAFgU8nTFMt3IN19/umNl+94Jf9WvJIlEc2nV69zMZJ09VFdVBL6HwqUgGIBpUt9NwcGnqtI2yhd+yKycLKvEKcj0iDVjmRVVlzWVGzBF9EHtbXF5FZfXwRR5vGPt0x727vfz7Qz7w+F1NueRkT9NMr6TmbPJpTKXauy8YH5tHpGd0szW0kN6kHizaAPyZR77Vz4MpEatpt/808+v9RRC1ohs0a95AZNivi2ncXxj3outWLEe5e6eyqOoyrxxNXgH+/0vkL3n+p0OJ0uEsAAAAASUVORK5CYII=')");
          break;
        case "amex":
         jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwwVpcfAswAAA7dJREFUWMPtl1tsFFUYx38zO3vpXrq7Xbpbbe0FbaJUhKaNpEQEChYUNTyBEjEhPqAJiTEUGh+8IsZgTYgxCiYUXyQaYvqg2Io0aSwXhdBSBRt6oU3s/bK73Qt76eweH4pDlqWUxzXZfzLJnDnfmfOb75zzP2ckIYQ4NRLhw78CDIVUMknFFh3vP2FnS2EO0qnhm2LXBS+ZrBNPuZCebBkXmZbJO1VqVZAzHRJgKKQi8z9RFjQLmulS7vZQAga2PoBFuf0dh64F2F+RmxZb1jxKNCHovyN+MfUF5lj36yR5RpnfN3vS2m7vmKZ9InZv0PUFRsKqoPrnMZJCUGpV+GWDG4BtHdN0e+MAHKtx8dojFnoDakp8kUWhbaObDWcmGQ6n258sSXy1yklrbT5LbQqNfwc5MRhmtdvI8RoXr//hTYFcEPRQpYO3u/x440mMMlzxzfHbRJSnPSZuBFX8cwKAfZ1+OurcBFVB/WUf3ngSAPWWNw+FVEKqoNyW2k1fUOXljhl+XJ/P4Z4gX/aGsOslPq928s4VP83/RBYf+kqnHk+OjtbRKAYZDlc7eeOij3e7Z2mvM2lxJRYdN0IqXd44y50GWkajWBWJuaRIm0ZvPmrTysvserp9cd667OfF9ikSAsw6iXObPHwzEObr/vD9zdHGKgcH/pxFFVBXYKLKZcCsk+gJqAwE57S4AyvsvHrey95OP2vdRhICdpdb+eJ6MOV9AthzyaeV13mMfL9mCT+NRGgbnx/e79a4UGSJg1cD97eYHrYqPO4w8MLgNACnx6KcHotq9Q1ds9r9pgdzyDfKXA+oDIVUDDLUL7OlgcrAD2uXaOWHzDqO9IZoG4+hSKAK2HF2hovPetj7mI3GnuDioB+ttNPUH+JmYn5evVRq1uo+vhrg7GQMt+n26myoyKW+008sCTvLzMiSlNZBEtjf6U/JcH9QRS9B2zNuvh0Mc7QvzOrWCTq3FDATT3J8ILywj3pMMrUFJs6MR3HoJY6scmLTy5ybirGtxMz2EjN2vURSgEM/D7RzqYVym4LbJPPBCvt8xiwKpVZFO/U49BJT0YR2TUcT5BtlWmrzmYgkaKjIZcethOy55OOTSgdbi3LSLdN9clgAfFbl4JUyS+rxqnmUSELwfKGJYzWutMZH+0LsLrcC8Om1APvu4rMLqWUkwq4LXorMOs5v9mCQpXv6qAaa3UKzoFnQLGiGgf5nzhn/u/ze8tyMBz240o78XGEOTTV5FFt0GQdYbNHRVJPHxgIT/wIHPWlnkbJpKwAAAABJRU5ErkJggg==')");
          break;
        case "dinersclub":
         jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMeER8iKChtYwAABCBJREFUWMPVmEtsFXUUxn9n5n8fpQ/QtqKUanmFBE0pC3wsBCHB4iN2U40udANKF26MkbBQgkZjYtWFXbLQFRhETE0aiUHFCDEQWDSmNvIsWKGltGnL7e2d1/+4uPe2tyYmc4kxlzM5i8lk5nxzzvnO+WZEVVOe5x0OguAZQKggExE1xvSlUqlOGR0dfa6xsbFXpKIwzpmqMjY21mE8z68VEZTKNBHB8/xaE4aBFKBXKlLCMBCjQNEr1RQw3CFI75yMqipFL8ccR5jKeExnfZLGwapybWKGqVseybRBSh6XMC5N9dU0N9YSRva2mG+Q28vo6cHr9J8f5elHV1KzKAma52P3gVN8dfwcVCfB5ieziJBOuuxsf5DPup4gKBesgIMtED6mC8LA5XGmb+XY1bGBpnsWk04YqlKG++prObSvg543tkE2ALcwUFBm/ZCew2d5am8v1mrsmKqABSdfI419TGZyDI+Ms3VjC5G1nOi/SmQtY5Oz/HZhBD+M6Hq2lVe2rYMgWpiZpOHomSG+ODaIcSVWvHx2FEcLqOO4I8Lg0DhPPrIGR4RPD55m+54jWKssSifY8NJ+vjz+B1Zh/+52mM4tXMqS965PjuIHEWXFVsoB6nBuZBKrMDmdY3f39yy+exGK4DgCdWm6PviObC4gaVx2dKwvYYTME8F1+ebXi/GBAo6WUXarlmVLqlCUPZ+fhIaaPGFKGmrWdbg2fgs/sqxb0ZC/rv+QO64wfDNDObEdVMpq7OKYuHhjCowzt33nnpEQrl6fxgECkblyL1zRQhDa+GRSyWdUJN5bIUrORijK9rZmyPolI1nzgHzLulUNRKpEuWA+6BxgoNDTcWIWsTn5YS+xegUVbk57qMJbL2ykOmkQpySbkdJUk+aumjQp43L0zBVwSgAWkxpGtLbUx+xRQbXAemISyg8jHl57L0EYkZkN+aHnRTI3ZoiskvVCEOHKkV0Iwvm/Jvjl5wt5lLpQDblVSbaub46XHEpYLzEnqVWlqaGWg8d+R1VpW7OUgQM7cF0hYRxGel9nNrDUVCV4/u1vYXndfEsUyRSEnOjuJJML4pWeIustiMTfTK4jvNz+EId/HGQmG7CkJg0KSeNSnTbMZH02v3mI/uGJheUuzOEPX91E28pG1Gq8TSigtqCeoDyFrwrtj62m79Qlkq5w/9I6/MDSd/oyPV+fJeeFkHTBj0CEVHWCLa3L+Xjn46xetgTPj8pa9AX1VEBdpiqpTifo3LwWRyCK8uXd3NbMR69t+td7pmZ8cl5Unh6R4lic64PyFakXhAvO/TD6z7VoUdaYYh9QuZ9M8wq/0r9CETDWRiq306T/F1AEEdRcHxkZWLtmVSSOuJUINBcE0dU/hwcEkHf2vbdl9YoHWirtX4kC5y9dGXr/3b0//Q0xKll2rgsDtgAAAABJRU5ErkJggg==')");
          break;
        case "discover":
          jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwwk9BnAiQAAAyFJREFUWMPtlj1IG2EYx/9nQwdBcJI4nFnqB6IItpPLe4e4SAcHdZKCQyaXgnXqIiXYJVA6pJMFqWCttlKkIPQDStFSY4VqNUdDiSZgY2LMJa0akrvcv4PlbNB+0FpraR54hvfj/9zv3v/7wCuRJP6BKME/EkXQImgRtAhaBP3fQLu7u6EoCvr6+rCysgIAyOfzUBQFlmXB4/GgqakJHo/HFs/MzKC5uRlVVVUIBoP7k9p9wHcOuH0B0O7DsizU1tbCMAwAAEk0NjYim81CURQ7dV2HJElwOp0QQiAWixWS8kvIssxIJMJ4PE5VVTk3N0fDMAiAi4uLVFWVJLmzs0OSnJycZE9PDzOZDA3D4Pb2NhmYID0ozMAEh4aGOD09TZL0+/10u9388sZgPB5nLpezx5lMhrOzs+zo6ODXUQCaTqdJkuFwmC0tLTZoOp2my+Vif3//PhDJiooKplKpgmK8KR8GvSlT13VWV1eTJFtbWxmJRGwwr9fL0dFRmqZJAFxaWuLg4CC9Xm9Bace37oTDcbBUVlaGtbU1LCwswOVyIRqNwjRNSJJUKJKOuPJnzqK8vBx1dXXw+XzY3d2FLMv2shACTqcTJSX72oGBAVRWVmJkZOT71icSCaqqyvn5eftEQ6EQNzY2aJoma2pqmEgkODY2RrfbbVuv6zq5On74RIOPSJKaphEA/X7/gZ1HWJ9MJtnQ0MBwOHy09V1dXRRCsLe3l4FAgCRpmiaFENza2mJ7eztLS0s5PDxsi6emplhfX09Zlqlp2v7k6jjpqyaHz5Pag4KPtbW10bIseyyEsDOZTFIIwWw2y83NTXZ2dtI0TdLKk69vUTrVD+f4CnDvIvAxDMepBPz0AZi+BKw/O+iZUwf49AoQuHu4uU8FYGodeNoPvJv65pa/B2rlgcgL4MllIL78w+0nD7q3DbwdBZ5fBcy9n5adDGhuFwg9BmavAbE3v1Tiz4EaGWDjFfDyOrD25LfLHR8oCexsApHnwPwNILpwrP/t+C2wvS0gtgRoE8DyHcDK/TGDHD8Nlf0IpEJAdBEIPgTezwCwTqwHPwN/YZwtBsJ9VwAAAABJRU5ErkJggg==')");
          break;
        case "jcb":
         jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMeER4ViY75LQAAA/lJREFUWMPNl0toXVUUhr+1z773nt7kJqV52NJXUlKdOAgmFKQhVXEgVHxAoZNaHaSg4AMEEbSoFTsQxIEDRSp0UBWKVi3iQKgKCoJUlA6qxsQSTW0N17aa3kfOczk4p7ettui+dXD3GZz72Hutf6/1r3+vLapaCoLg3SiKtgJCBw0RUWvtR6VSaZssLCzcNTAwcFikozC2hqpSrVbvNkEYVjoVZB5VgjCs2DiOBEDRzgSKEMeR2Isx7tSQZi+rmmHUa7FytZ9UrzBH2+Ap2IuLHQ2IwZzczZ/1JiJCqTyKXbOZ8PuXEfFIk0X8kRcx1X2cb1QBoVDopTj0TFtgrebsVMdIzhy9k7FvX6LhrYKol483b2fiqV0svbMK/BSvR/n5i0nGP11Lw+uCsMgbG7/jgaE2Kh/FSpuVuGv2IRqF68DUIe3G+yUkfXMQVnuAR++KkKnf1tEodeXeDEVTaJtgNs0RuyZjSXyQCMgsENIiEpIRa0nlHw7dPSkpYKVVTeq0QyG5vFBM64/W8K7s15FogqhitRVRdeLMZbBrEA0CYUx6aiFDXRSaGkK9lk2LfES62qoIvZAs16V6yYdlAtvHDH1ngUGf8uN7IQqh+CsT+jvDo7fhW58TtZBGfLBtuTbt6nBYT0CU5Sj7Jw2D9XN0T/+ENuo0X3uV2qGD3L/pHh7deAcfTH/IoYkpbqysbVv3jeL+pMAj4730JVDJSdkslWA5JLOziFqoNUlEKBrL6nI/ZxKINEbbfCyAqFMtIcDb03Xe37qC0X6Px44qE+dhaPQWlr3yAtH4TZR7Fjh87HOC3n5uH9rCwbmvWB/W3c+VluCrO71TlHqsTL53BoohLK7k3hsqhMeOEmzZgvF7KK+K2P/WGJ98/Q1YH2oJ+0a7neVJ81bPKgKSfXHZZWqAsgExUDEkcYIpVvAG+7IJPQHdZhl09+VaVcKXWg7TJX2CIheK6Vr60avkQ/5N1tySb1NS5xMjbc3N3yqk6l20a4Do75piSDR11lEBUlLa6kdFIIhWQjCYI6+yyf+SZljBzOeG9v7B2XNliHxQQ3c8w86RbSxpe0pqVbMu2q2Y4Ol1r1NNV2JSmBpeJGnuxDx/BLoKUAYePMCTRx5m+/oBNFV2rL+ZxeVPUCBw7vBVQY7P/LDj+pGRA0EcORkoSYrJExFKAaMx1mQbToE48ShJhGBQlAiPKIkxxu2MKdkCP87O3mezHty4d0+arckuXAkJQphcSv+Epl6wKwgpYtz9CAYVyQX/f7qIyH+7rDj6UATFqqpKK4mdeLczCKL29OlTx0c2bEhExOtEoGESJvMn548LIM/t3XPr8JqhoU4EemJ+bm7P7mc/+wsDZdvQkw6JAQAAAABJRU5ErkJggg==')");
          break;
        default:
         jQuery('#brand-icon').css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALNJREFUeNpinDlzpgADA8N6IHZgGJzgABAHMg1yRzJA3baeaZA7Eu5YJoYhAkYdSm3Agi6gq6vLwMbGRpZhv379Yrh8+TJ9HGppaUmRgW/fvmV49uzZaBoddeioQ0cdOtgc+vPnT/qUo2vXrmVgZ2cn25GgcpQuDqWVRaNpdNA3Ss6ePYtXg7GxMV41hORJUTMa9aMOBQJGYHf5/2iIjlSHHhgC7jwAcmjgIHcsyG2BAAEGANjdMoqS1DgpAAAAAElFTkSuQmCC')");
      }
    }
    for (var i = brandIconElement.classList.length - 1; i >= 0; i--) {
      brandIconElement.classList.remove(brandIconElement.classList[i]);
    }
    brandIconElement.classList.add('pf');
    brandIconElement.classList.add(pfClass);
  }


  /**
   * Translate Function
   */
  translate(name){
    return TranslationService.translation[name];
  }

}
