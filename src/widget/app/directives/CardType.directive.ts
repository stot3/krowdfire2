import {Directive, ElementRef, OnInit, OnChanges, AfterViewInit, Input, SimpleChange} from "@angular/core";
import {UtilService} from "../service/Util.service";
import {StripeService} from "../service/Stripe.service";

declare var jQuery: any;

@Directive({
  selector: "[CardType]"
})

export class CardTypeDirective {

  @Input() cardNumber: any;
  cardMaxLength: number;
  cvcMaxLength: number;
  $card: any;

  constructor(private element: ElementRef, private stripeService: StripeService) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    this.$card = jQuery(this.element.nativeElement);
    var cardNumberChange = changes["cardNumber"];
    if (parseInt(cardNumberChange.currentValue) != cardNumberChange.previousValue) {
      this.checkCardType();
    }
  }

  ngAfterViewInit() {
    this.$card.payment("formatCardNumber");
  }


  checkCardType() {
    var cardType = jQuery.payment.cardType(this.cardNumber);

    switch(cardType) {
      case "visa":
        this.$card.css("background", "#fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwQ0IXda5QAAAvNJREFUWMPtll2IjFEcxn/zzqeZ3R0zO4u1g12zVrIktIhNIm4UiVyQfCREbBLJhYgkN4oLKSStFOVC2ZbCZvPRUutrGGbFsqbBsrPzPfu+57h412ykLOvCMs/V6fS+nd95/s9TxzByyxNJP5BCP1EONAf6t8sgpcy1/r8ENf1w97jhx1+bC2BVpB846hwFQDSl4avx46vxk0gLdpxtw1fjp6klDkC6S1Db+In5h1qYvCvA1jNtCNFThetPoozZ9hRfjZ+OuNYHR8esg0wnGG1E3j3GGWvS9weOBuCGPwbAwslO7FaFmwEdsMRtQdUks/cHCXWolBZZKHGZufqoE0UpAUAIyebTb8moOvjL92kmltl/E7T6WHYp4iqrD5zg5PD1SIcXA3C47gMAm+Z60IQkHFEBKMwz4m9LEepQmVpup3ZTaRbuqx60JklkJOWDLQTDGe69TPQK9KejdzlM3O+ayerWY6SsI/gYVXn1IcNQl5myQVaiSaHH1whWs4LTbgTgTjDBqYZ2NCFRlJ7MH7z0HoAjK70A1D+M/rmMLqpy0hCr5o1jDnXNnQDsXDAYgFBHFwBVPgcAIzwW9i4eAsC+i2Gq97wgltJz2B5TaWpJML3CQUWxjTyrQvPr5DeO9wl03vgCABreuDlSr499dmUeAMFwuhu0Z3zLZrhp2lfBuGE2whE1G5Xaxs8AzJ9YQDIjmFA6AIBPvShUr0DHem3ZsbXHNJbPcGE16b8+eJ0EoHKYDSlltiTuPBNrZhUCEE8LVE1y9IoOvPNciMrtz2jsLmFL92V/vUzfKX+AEaddIZLQ87i2GwDg1nP9sLJBViIJwaRdASq9NoQEf1sKgA1zPNx+EUcTuvNLpw0EIPAuzfFr7dwNJphS7ug7qA7n4dztzxS7zHgLLQBIKYmnBV63maJ8E0JKFlc5uRmIo2qSFdUuNs4twpNvYveFEF63mb1Lihk1xApAKiO43NzJw9Zk7lGSA/0HXk/nDTlHc6A50D+gL+loLFjxf8xyAAAAAElFTkSuQmCC) no-repeat right 10px center");
        break;
      case "mastercard":
        this.$card.css("background", "#fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwsjJTzD7QAABH5JREFUWMPtmG1sU2UUx3/3tr3d7Vq6rttoN8eG4IARcCIMRtyCAx1OQDCBGEIkBP1AglkCiDGKLqAJMYAZQtDxQRc+QTSEYAjyIgQNaTZgc7xsbBM2unWvbSlbX9a1vX7gTaKMC8OkJJ7kfrg3J8/95Tzn/M95HkFRFOW04yK79/1MR5ebeLL0tGTWrlzInFlTEE47Lioff/UD8WzbP3kPzYCUWd4/EIxr0MvNbYjxtt3/Zh1dbkSeEXtmQLWP5a0oZIb8FLq7yb/ZS2o4RLde5rzZyhmrDWdCIgjCXWfy7D0sntjMi9YuzNogvohMvWc0BxtyqOtMAwTVvxYK3l6vqHG0hAfZ2niOjFDgoT7OBAObJryMnBamsuQIZu3Di9QXkfngZAktbsvTA80Z8LHtSrWqPBFHhTGV9aCxqovUZ9WvcqIle+Q5ag2HVEMK+igJ03sYOgsxlYq3Of8UOSmeEYIqClsaL6iuOP3UvntpF6lWn/oVxceA2JODZgX9jAn51eWQMYw4aujee+zW7UeNmbVBZo3pUg+q0Yjs3ryGovzJmIwy279ci6503jB0AtKS0tvyYfvnXsfaAVGCl7bDwmswaeNDl1o6qREAg6ynvGz58PKUYhlFZnoqYzNtZNhSsCSbGXJ7MO79GjHdhnLTh//Dckw/fU/M6SK4tYLEbZuJub0krJiJmD0evJ0MVW1Av+Mi0WPbYFYh3NgPtRtA0MCMPWDKgaF+qH4fik9C8x6mTUjiyDtrqG+8jqvbPXxEx2fZOXTMQYbNSprVjE6AaFs7wZ2VhCqr0BUVoJ2RR6zVycDqMpAkghXfobi9aKbOJvLjF4jTShFfyEfp7yVych/YX4eOw4ACSgSadsHVnZBWCElTIdQJ3lr0aTMoXfU5oVCY2svXhgfNmzyO85daWFCcz4nf69BmZSK9Ngfd3CKibR1Em/4kfOgowR17SKo5ju6VmUQu1COYjMTaGlA8LsKbiiDRQvR4JYIwAEoMpOQ7c9sCSH8T/K3gbwPZDs3fgkbP0K1WBEFgXLadlrbO4UFzx2fS0uqi+o8mXD0e2s5UE6mpRZpfjH7ZIgYP/4Jp/14M5RsJbK0g2u7CuGMLkUsNKGEJ6aODiLOXIabnELt6Fk2qAqffuL298+sg1AXPvQXZy+HGATDngvcC9DkIGKawZf0KZL1En8f3eII/NtDPN5cc6qreMIRc0P3AN6kIRLO6yl/3WwkOZ/qTydN12UhHgkHdGBDQERvQ3V/YpB5yIKrH4bSNQPAFgU8nTFMt3IN19/umNl+94Jf9WvJIlEc2nV69zMZJ09VFdVBL6HwqUgGIBpUt9NwcGnqtI2yhd+yKycLKvEKcj0iDVjmRVVlzWVGzBF9EHtbXF5FZfXwRR5vGPt0x727vfz7Qz7w+F1NueRkT9NMr6TmbPJpTKXauy8YH5tHpGd0szW0kN6kHizaAPyZR77Vz4MpEatpt/808+v9RRC1ohs0a95AZNivi2ncXxj3outWLEe5e6eyqOoyrxxNXgH+/0vkL3n+p0OJ0uEsAAAAASUVORK5CYII=) no-repeat right 10px center");
        break;
      case "amex":
        this.$card.css("background", "#fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAcCAYAAAAX4C3rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPEwwVpcfAswAAA7dJREFUWMPtl1tsFFUYx38zO3vpXrq7Xbpbbe0FbaJUhKaNpEQEChYUNTyBEjEhPqAJiTEUGh+8IsZgTYgxCiYUXyQaYvqg2Io0aSwXhdBSBRt6oU3s/bK73Qt76eweH4pDlqWUxzXZfzLJnDnfmfOb75zzP2ckIYQ4NRLhw78CDIVUMknFFh3vP2FnS2EO0qnhm2LXBS+ZrBNPuZCebBkXmZbJO1VqVZAzHRJgKKQi8z9RFjQLmulS7vZQAga2PoBFuf0dh64F2F+RmxZb1jxKNCHovyN+MfUF5lj36yR5RpnfN3vS2m7vmKZ9InZv0PUFRsKqoPrnMZJCUGpV+GWDG4BtHdN0e+MAHKtx8dojFnoDakp8kUWhbaObDWcmGQ6n258sSXy1yklrbT5LbQqNfwc5MRhmtdvI8RoXr//hTYFcEPRQpYO3u/x440mMMlzxzfHbRJSnPSZuBFX8cwKAfZ1+OurcBFVB/WUf3ngSAPWWNw+FVEKqoNyW2k1fUOXljhl+XJ/P4Z4gX/aGsOslPq928s4VP83/RBYf+kqnHk+OjtbRKAYZDlc7eeOij3e7Z2mvM2lxJRYdN0IqXd44y50GWkajWBWJuaRIm0ZvPmrTysvserp9cd667OfF9ikSAsw6iXObPHwzEObr/vD9zdHGKgcH/pxFFVBXYKLKZcCsk+gJqAwE57S4AyvsvHrey95OP2vdRhICdpdb+eJ6MOV9AthzyaeV13mMfL9mCT+NRGgbnx/e79a4UGSJg1cD97eYHrYqPO4w8MLgNACnx6KcHotq9Q1ds9r9pgdzyDfKXA+oDIVUDDLUL7OlgcrAD2uXaOWHzDqO9IZoG4+hSKAK2HF2hovPetj7mI3GnuDioB+ttNPUH+JmYn5evVRq1uo+vhrg7GQMt+n26myoyKW+008sCTvLzMiSlNZBEtjf6U/JcH9QRS9B2zNuvh0Mc7QvzOrWCTq3FDATT3J8ILywj3pMMrUFJs6MR3HoJY6scmLTy5ybirGtxMz2EjN2vURSgEM/D7RzqYVym4LbJPPBCvt8xiwKpVZFO/U49BJT0YR2TUcT5BtlWmrzmYgkaKjIZcethOy55OOTSgdbi3LSLdN9clgAfFbl4JUyS+rxqnmUSELwfKGJYzWutMZH+0LsLrcC8Om1APvu4rMLqWUkwq4LXorMOs5v9mCQpXv6qAaa3UKzoFnQLGiGgf5nzhn/u/ze8tyMBz240o78XGEOTTV5FFt0GQdYbNHRVJPHxgIT/wIHPWlnkbJpKwAAAABJRU5ErkJggg==) no-repeat right 10px center");
        break;
      default:
        this.$card.css("background-image", "none");
    }
  }
}
