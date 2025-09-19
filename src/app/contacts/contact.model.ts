import { Title } from "@angular/platform-browser"

export interface Contact {
  id: string,
  personal: boolean,
  firstName: string,
  lastName: string,
  dateOfBirth: Date | null,
  favoritesRanking: number | null,
  phones: Phone[],
  address: Address,
  notes: string
}

export interface Phone {
  phoneNumber: string,
  phoneType: string,
  preferred: boolean
}

export interface Address {
  streetAddresses: string[] ,
  city: string,
  state: string,
  postalCode: string,
  addressType: string,
}

export const phoneTypeValues = [
  {title: 'Mobile', value: 'mobile'},
  {title: 'Work', value: 'work'},
  {title: 'Other', value: 'other'}
];


export const addressTypeValues = [
  {title: 'Home', value: 'home'},
  {title: 'Work', value: 'work'},
  {title: 'Other', value: 'other'}
];
