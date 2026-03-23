import {
  trigger, transition, style, animate, query,
  stagger, keyframes, state
} from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(28px)' }),
    animate('550ms cubic-bezier(.35,0,.25,1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const fadeInUpDelay = (delay: string) =>
  trigger('fadeInUpDelay', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(28px)' }),
      animate(`550ms ${delay} cubic-bezier(.35,0,.25,1)`,
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

export const staggerChildren = trigger('staggerChildren', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(32px)' }),
      stagger('80ms', [
        animate('500ms cubic-bezier(.35,0,.25,1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-32px)' }),
    animate('500ms 200ms cubic-bezier(.35,0,.25,1)',
      style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(32px)' }),
    animate('500ms 200ms cubic-bezier(.35,0,.25,1)',
      style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const pulseAnimation = trigger('pulse', [
  state('active', style({ transform: 'scale(1.05)' })),
  state('inactive', style({ transform: 'scale(1)' })),
  transition('inactive <=> active', [animate('600ms ease-in-out')])
]);
