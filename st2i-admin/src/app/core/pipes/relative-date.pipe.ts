import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

@Pipe({
  name: 'relativeDate',
  standalone: true
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | undefined | null): string {
    if (!value) return 'Jamais';
    const date = typeof value === 'string' ? new Date(value) : value;
    return `il y a ${formatDistanceToNow(date, { locale: fr })}`;
  }
}
