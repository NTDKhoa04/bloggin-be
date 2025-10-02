export interface MailReplacementsDto {
  username: string;
}

export interface AdminWarningReplacementsDto extends MailReplacementsDto {
  postLink: string;
}

export interface EmailVerificationReplacementsDto extends MailReplacementsDto {
  verifyLink: string;
}
