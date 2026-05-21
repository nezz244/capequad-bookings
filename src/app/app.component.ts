import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { SeoConfig } from 'app/core/seo/seo.types';
import { SeoService } from 'app/core/seo/seo.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
    private _destroy$ = new Subject<void>();

    constructor(
        private _router: Router,
        private _seo: SeoService
    ) {}

    ngOnInit(): void
    {
        this._seo.applyDefault();

        this._router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => {
                let route = this._router.routerState.root;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return { route, url: this._router.url };
            }),
            takeUntil(this._destroy$)
        ).subscribe(({ route, url }) => {
            if (url.startsWith('/success') || url.startsWith('/failure')) {
                this._seo.update({
                    title: 'Booking | CapeAdrenaline',
                    description: 'Your CapeAdrenaline booking status.',
                    path: url.split('?')[0],
                    noindex: true
                });
                return;
            }

            const seo = route.snapshot.data['seo'] as SeoConfig | undefined;
            if (seo) {
                this._seo.update(seo);
            } else {
                this._seo.applyDefault();
            }
        });
    }

    ngOnDestroy(): void
    {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
