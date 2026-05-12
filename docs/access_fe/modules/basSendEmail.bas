Option Compare Database

Private Const cdoSendUsingPort = 2
Private Const cdoBasic = 1
Private Const cdoNTLM = 2

' The docmentation of all these settings is available at
' https://msdn.microsoft.com/en-us/library/ms872853.aspx

Private Const cdoSendUsingMethod = "http://schemas.microsoft.com/cdo/configuration/sendusing"
Private Const cdoSMTPServer = "http://schemas.microsoft.com/cdo/configuration/smtpserver"
Private Const cdoSMTPServerPort = "http://schemas.microsoft.com/cdo/configuration/smtpserverport"
Private Const cdoSMTPUseSSL = "http://schemas.microsoft.com/cdo/configuration/smtpusessl"
Private Const cdoSMTPAuthenticate = "http://schemas.microsoft.com/cdo/configuration/smtpauthenticate"
Private Const cdoSendUserName = "http://schemas.microsoft.com/cdo/configuration/sendusername"
Private Const cdoSendPassword = "http://schemas.microsoft.com/cdo/configuration/sendpassword"


Public Function SendMail(strTo As String, strSubject As String, strMessage As String, sFile As String, Optional bFileAttach As Boolean = False, Optional bPreview As Boolean = False, Optional strBCC As String) As Boolean

    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 10/25/18 15:15 A
    ' Modified:
    
    On Error GoTo PROC_ERR




    Dim mail    As Object           ' CDO.MESSAGE
    Dim config  As Object           ' CDO.Configuration
    
    Set mail = CreateObject("CDO.Message")
    Set config = CreateObject("CDO.Configuration")
    
    config.Fields(cdoSendUsingMethod).Value = cdoSendUsingPort
    config.Fields(cdoSMTPServer).Value = "smtp.office365.com"
   
    config.Fields(cdoSMTPServerPort).Value = 25  ' implicit SSL - Does not work with Explicit SSL (StartTLS) usually on Port 587
    config.Fields(cdoSMTPUseSSL).Value = "true"
    
    config.Fields(cdoSMTPAuthenticate).Value = cdoBasic
    config.Fields(cdoSendUserName).Value = "cms@dakotasteelandtrim.com"
    config.Fields(cdoSendPassword).Value = "Dropsheet9080!!"

    config.Fields.Update
    
    Set mail.Configuration = config
    
    With mail
        .To = strTo
        .FROM = "cms@dakotasteelandtrim.com"
        .Subject = strSubject
        .HtmlBody = strMessage
        .bcc = strBCC
        'sFile = CurrentProject.Path & "\19046-SO.pdf"
        If sFile <> "" Then
           .AddAttachment sFile
        End If
        .Send
        SendMail = True
    End With
    
    Set config = Nothing
    Set mail = Nothing

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "modWSI.SendCDOMail"
    Resume PROC_EXIT
End Function