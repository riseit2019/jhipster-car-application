import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ICar, Car } from 'app/shared/model/car.model';
import { CarService } from './car.service';
import { IDocument } from 'app/shared/model/document.model';
import { DocumentService } from 'app/entities/document/document.service';

@Component({
  selector: 'jhi-car-update',
  templateUrl: './car-update.component.html'
})
export class CarUpdateComponent implements OnInit {
  isSaving = false;
  documents: IDocument[] = [];

  editForm = this.fb.group({
    id: [],
    model: [],
    document: []
  });

  constructor(
    protected carService: CarService,
    protected documentService: DocumentService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ car }) => {
      this.updateForm(car);

      this.documentService
        .query({ filter: 'car-is-null' })
        .pipe(
          map((res: HttpResponse<IDocument[]>) => {
            return res.body || [];
          })
        )
        .subscribe((resBody: IDocument[]) => {
          if (!car.document || !car.document.id) {
            this.documents = resBody;
          } else {
            this.documentService
              .find(car.document.id)
              .pipe(
                map((subRes: HttpResponse<IDocument>) => {
                  return subRes.body ? [subRes.body].concat(resBody) : resBody;
                })
              )
              .subscribe((concatRes: IDocument[]) => (this.documents = concatRes));
          }
        });
    });
  }

  updateForm(car: ICar): void {
    this.editForm.patchValue({
      id: car.id,
      model: car.model,
      document: car.document
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const car = this.createFromForm();
    if (car.id !== undefined) {
      this.subscribeToSaveResponse(this.carService.update(car));
    } else {
      this.subscribeToSaveResponse(this.carService.create(car));
    }
  }

  private createFromForm(): ICar {
    return {
      ...new Car(),
      id: this.editForm.get(['id'])!.value,
      model: this.editForm.get(['model'])!.value,
      document: this.editForm.get(['document'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICar>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: IDocument): any {
    return item.id;
  }
}
