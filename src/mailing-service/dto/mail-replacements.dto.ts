export interface MailReplacementsDto {
  username: string;
}

export interface AdminWarningReplacementsDto extends MailReplacementsDto {
  postLink: string;
}

export interface EmailVerificationReplacementsDto extends MailReplacementsDto {
  verifyLink: string;
}

export interface AdminUnflagReplacementsDto
  extends AdminWarningReplacementsDto {}

export interface PaymentCompletedReplacementsDto extends MailReplacementsDto {
  transactionId: string;
  date: string;
  amount: string;
  dashboardLink: string;
}
