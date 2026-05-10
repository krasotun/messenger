export interface SignUpRequestDto {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignUpResponseDto {
  id: number;
}
