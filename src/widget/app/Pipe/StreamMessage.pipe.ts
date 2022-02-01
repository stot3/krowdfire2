import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'streamMessage'
})

export class StreamMessagePipe implements PipeTransform {
  transform(value: string) {
    if (value.length > 250) {
      value = value.substr(0, 250) + " ... View more</p>";
    }
    return value;
  }
}
