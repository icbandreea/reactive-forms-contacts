import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { addressTypeValues, phoneTypeValues } from '../contacts/contact.model';
import { restrictedWords } from '../validators/restricted-words.validator';
import { DateValueAccessorDirective } from '../date-value-accessor/date-value-accessor.directive';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  imports: [CommonModule, ReactiveFormsModule, DateValueAccessorDirective],
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  phoneTypes = phoneTypeValues;
  addressTypes = addressTypeValues;
  contactForm = this.fb.nonNullable.group({
    id : '',
    personal: false,
    firstName : ['', [Validators.required, Validators.minLength(3)]],
    lastName : '',
    dateOfBirth : <Date | null> null,
    favoritesRanking : <number | null> null,
    phones: this.fb.array([this.createPhoneGroup()]),
    address: this.fb.nonNullable.group({
      streetAddresses: this.fb.array([this.createStreetAddress()]),
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: '',
    }),
     notes: ['', restrictedWords(['foo', 'bar'])],
  });


  constructor(
    private route: ActivatedRoute, 
    private contactsService: ContactsService, 
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) {
      this.subscribeToAddressChanges();
      return;
    }

    this.contactsService.getContact(contactId).subscribe((contact) => {
      if(!contact) return;

      for(let i =1; i < contact.phones.length; i++) {
        this.addPhone();
      }

      for(let i = 1; i< contact.address.streetAddresses.length; i++ ) {
        this.addStreetAddress();
      }

      this.contactForm.setValue(contact);
      this.subscribeToAddressChanges();

    });
  }

  subscribeToAddressChanges() {
    const addressGroup = this.contactForm.controls.address;
    addressGroup.valueChanges
      .pipe(distinctUntilChanged(this.stringifyCompare))
      .subscribe(() => {
        for(const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.removeValidators([Validators.required]);
          addressGroup.get(controlName)?.updateValueAndValidity();
        }
      });
      addressGroup.valueChanges
      .pipe(debounceTime(2000) ,distinctUntilChanged(this.stringifyCompare))
      .subscribe(() => {
        for(const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.addValidators([Validators.required]);
          addressGroup.get(controlName)?.updateValueAndValidity();
        }
      });
  }

  stringifyCompare(a:any, b:any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  createPhoneGroup() {

    const phoneGroup = this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
      preferred: false 
    });

    phoneGroup.controls.preferred.valueChanges
      .pipe(distinctUntilChanged((this.stringifyCompare)))
      .subscribe(value => {
        if(value) {
          phoneGroup.controls.phoneNumber.addValidators([Validators.required]);
        } else {
          phoneGroup.controls.phoneNumber.removeValidators([Validators.required]);
        }
        phoneGroup.controls.phoneNumber.updateValueAndValidity();
      });

    return phoneGroup;
  }

  createStreetAddress() {
    return this.fb.nonNullable.control('', Validators.required);
  }

  get firstName() {
    return this.contactForm.controls.firstName;
  }

  get address() {
    return this.contactForm.controls.address;
  }

  get notes() {
    return this.contactForm.controls.notes;
  }


  saveContact() {
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    });
  }

  cancelContact() {
    this.router.navigate(['/contacts']);
  }
  

  addPhone() {
    return this.contactForm.controls.phones.push(this.createPhoneGroup());
  }

  addStreetAddress() {
    return this.contactForm.controls.address.controls.streetAddresses.push(this.createStreetAddress());
  }
}
