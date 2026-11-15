import { DestroyRef, inject, provideEnvironmentInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { filter } from 'rxjs';

// Кит о роутере не знает, поэтому закрытие окон по переходу держим здесь.
// Слушаем только завершенный переход: отмененный оставляет человека на месте,
// и окно ему еще нужно. CDK disposeOnNavigation и Location тут не годятся:
// они не видят router.navigateByUrl.
export const provideDialogsCloseOnNavigation = () =>
  provideEnvironmentInitializer(() => {
    const dialogService = inject(DialogService);
    const confirmationService = inject(ConfirmationService);

    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        // Копия ключей: close() убирает ссылку из карты по ходу обхода.
        for (const dialogRef of [...dialogService.dialogComponentRefMap.keys()]) {
          dialogRef.close();
        }

        // Окно подтверждения кит держит отдельно от DialogService. close()
        // прячет его, не вызывая ни accept, ни reject: действие не выполнится.
        confirmationService.close();
      });
  });
