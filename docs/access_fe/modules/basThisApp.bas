Option Compare Database
Option Explicit

Global frm As Form
Global ctl As Object
Global ctlValue As Object
Global ctlFocus As Object
Global cFileLoc As String

'this variable is to call frmDataPicker from Diary Default to requery the txtDateValue field
'and determine if is a new date or find a date.

Global sflag As Integer

#If VBA7 Then
    Private Declare PtrSafe Function GetLocaleInfo Lib "kernel32" Alias "GetLocaleInfoA" (ByVal locale As Long, ByVal LCType As Long, ByVal lpLCData As String, ByVal cchData As Long) As Long
    Private Declare PtrSafe Function GetSystemDefaultLCID Lib "kernel32" () As Long
#Else
    Private Declare Function GetLocaleInfo Lib "kernel32" Alias "GetLocaleInfoA" (ByVal locale As Long, ByVal LCType As Long, ByVal lpLCData As String, ByVal cchData As Long) As Long
    Private Declare Function GetSystemDefaultLCID Lib "kernel32" () As Long
#End If

Private Const LOCALE_USER_DEFAULT = &H400
Private Const LOCALE_SDECIMAL As Long = &HE
Private Const LOCALE_ILDATE As Long = &H22
Private Const LOCALE_ICOUNTRY As Long = &H5
Private Const LOCALE_SENGCOUNTRY = &H1002 ' English name of country
Private Const LOCALE_SENGLANGUAGE = &H1001 ' English name of language
Private Const LOCALE_SNATIVELANGNAME = &H4 ' native name of language
Private Const LOCALE_SNATIVECTRYNAME = &H8 ' native name of country
Private Const LOCALE_SSHORTDATE = &H1F

#If VBA7 Then
  Private Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal lngMilliSeconds As Long)
#Else
  Private Declare Sub Sleep Lib "kernel32" (ByVal lngMilliSeconds As Long)
#End If



Public Enum Production
    Panels = 1
    Trims = 2
    Boxes = 3
    BoxesBO = 4
    PanelsBO = 5
    Soffit = 6
    SoffitBO = 7
    TrimsBO = 8
End Enum


Public Sub WaitSeconds(ByVal intSeconds As Integer)
  ' Comments: Waits for a specified number of seconds
  ' Params  : intSeconds    Number of seconds to wait
  
  
  On Error GoTo PROC_ERR
  
  Dim datTime As Date
  
  ' Calculate the future time to stop waiting
  datTime = DateAdd("s", intSeconds, Now)
  
  Do
    ' Yield to other programs (better than using DoEvents which eats up all the CPU cycles)
    Sleep 100
    DoEvents
  Loop Until Now >= datTime
  
PROC_EXIT:
  Exit Sub

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modWaiting.WaitSeconds"
  Resume PROC_EXIT
End Sub

Function SelectionType(lngID As Long, lngSelection As Long) As String
    ' Comments:
    ' Params  :
    ' Returns : Variant
    ' Created : 03/30/20 13:33 A
    ' Modified:
    
    On Error GoTo PROC_ERR
    Dim strSQL As String
Select Case lngID
    Case 1 'Panels
        strSQL = "Select Panel from tlkPanel Where PanelID=" & lngSelection
        SelectionType = ExecScalar(strSQL)
    Case 2 'Trims
        strSQL = "Select Trim from tlkTrim Where TrimID=" & lngSelection
        SelectionType = ExecScalar(strSQL)
    Case 3 'Parts/Boxes
        strSQL = "Select Box from tlkBox Where BoxID=" & lngSelection
        SelectionType = ExecScalar(strSQL)
    Case 6 'Soffit
        strSQL = "Select Soffit from tlkSoffit Where ID=" & lngSelection
        SelectionType = ExecScalar(strSQL)
End Select

If Nz(SelectionType, "") = "" Or SelectionType = "0" Then SelectionType = "N/A"
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "Module1.SelectionType"
    Resume PROC_EXIT

    
End Function
Public Function GetInfo(ByVal lInfo As Long) As String
    'GetInfo = Forms!frmCalendar!txtRegion
    'Exit Function
    
Dim buffer As String
Dim Ret As String
    buffer = String$(256, 0)
    Ret = GetLocaleInfo(LOCALE_USER_DEFAULT, lInfo, buffer, Len(buffer))
    If Ret > 0 Then
        GetInfo = Left$(buffer, Ret - 1)
    Else
        GetInfo = ""
    End If
End Function

Function RenameButtons()
Dim frm As Form, ctl As Control, i As Integer, strName As String

Set frm = Screen.ActiveForm
i = 1
For Each ctl In frm.Detail.Controls
   If ctl.ControlType = acCommandButton Then
        strName = "cmd" & i
        ctl.Name = strName
        i = i + 1
   End If
Next

End Function

Public Function DropsheetAddress(lngOrderNumber As Long, sSite As Single) As String
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 07/17/20 08:55 AD
    ' Modified:
    
    
    'On Error GoTo PROC_ERR
    
    Dim strSQL As String, strAddress As String, db As dao.Database, rs As dao.Recordset
    
    Set db = CurrentDb
    Select Case sSite
        Case 2
            strSQL = "Select ShipAddress,ShipCity,ShipState,ShipZip from tblOrders Where OrderNumber=" & lngOrderNumber
            Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
            
            If Not rs.EOF Then
                DropsheetAddress = rs!ShipAddress & vbCrLf & rs!ShipCity & " " & rs!ShipState & " " & rs!ShipZip
                GoTo PROC_EXIT
            End If
        
        Case 1, 3, 7
            strSQL = "Select JobAddress,JobCity,JobState,JobZip from tblOrders Where OrderNumber=" & lngOrderNumber
            Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
            
            If Not rs.EOF Then
                DropsheetAddress = rs!JobAddress & vbCrLf & rs!JobCity & " " & rs!JobState & " " & rs!JobZip
                GoTo PROC_EXIT
            End If
    End Select
    
    DropsheetAddress = vbNullString
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basThisApp.DropsheetAddress"
    Resume PROC_EXIT



End Function
Function HexToLongRGB(sHexVal As String) As Long
    Dim strColor As String
    Dim strR As String
    Dim strG As String
    Dim strB As String
    

    If Left(sHexVal, 1) = "#" Then
        sHexVal = Right(sHexVal, Len(sHexVal) - 1)
    End If
    
    strR = Left(sHexVal, 2)
    strG = Mid(sHexVal, 3, 2)
    strB = Right(sHexVal, 2)
    strColor = strB & strG & strR
    HexToLongRGB = CLng("&H" & strColor)

End Function
Public Function ChooseWebColor(DefaultWebColor As Variant) As String
  Dim lngColor As Long
  lngColor = CLng("&H" & Right("000000" + _
                  Replace(Nz(DefaultWebColor, ""), "#", ""), 6))
  'wlib_AccColorDialog Screen.ActiveForm.hwnd, lngColor
  ChooseWebColor = "#" & Right("000000" & Hex(lngColor), 6)
End Function
Public Function GetCompanyAddress()
    ' Comments:
    ' Params  :
    ' Returns : Variant
    ' Created : 02/18/20 10:52 A
    ' Modified:
    
    On Error GoTo PROC_ERR

Dim db As dao.Database, rs As dao.Recordset, strSQL As String, strAddress As String
Set db = CurrentDb
strSQL = "Select Top 1 * from tblCompany"
Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)

If Not rs.EOF Then
    TempVars.Add "MainColor", ""
    TempVars.Add "AlternateColor", ""
    TempVars.Add "CompanyName", ""
    TempVars.Add "CompanyAddress", ""
    TempVars.Add "CompanyLogo", ""
    TempVars.Add "CompanyTaxRate", 0
    TempVars.Add "ServiceAccount", 0
    TempVars.Add "Location", 0
    TempVars.Add "Hub", 0
    TempVars.Add "MaxWeight", 0
    TempVars.Add "QBAR", ""
    TempVars.Add "QBTemplate", ""
    TempVars.Add "CompanyTaxName", ""
    TempVars.Add "DunnageWeight", 0
    TempVars.Add "MoffetWeight", 0
    TempVars.Add "Longitude", 0
    TempVars.Add "Latitude", 0
    TempVars.Add "LocationButtons", 0
    TempVars.Add "PackRecipient", ""
    If Nz(rs!CompanyName, "") <> "" Then strAddress = rs!CompanyName & vbCrLf: TempVars!CompanyName = rs!CompanyName.Value
    If Nz(rs!Address, "") <> "" Then strAddress = strAddress & rs!Address & vbCrLf
    If Nz(rs!Phone, "") <> "" Then strAddress = strAddress & "Phone: " & rs!Phone & vbCrLf
    If Nz(rs!Fax, "") <> "" Then strAddress = strAddress & "Fax: " & rs!Fax & vbCrLf
    If Nz(rs!Email, "") <> "" Then strAddress = strAddress & "E-Mail: " & rs!Email
    If Len(strAddress) > 0 Then TempVars!CompanyAddress = RTrim(strAddress)
    If Nz(rs!Logo, "") <> "" Then TempVars!companylogo = rs!Logo.Value
    If Nz(rs!CompanyTaxRate, 0) <> 0 Then TempVars!CompanyTaxRate = rs!CompanyTaxRate.Value
    If Nz(rs!MasterPassword, "") <> "" Then TempVars!MasterPassword = rs!MasterPassword.Value
    TempVars!PackRecipient = rs!PackRecipient.Value
    TempVars!MainColor = Nz(rs!MainColor.Value, "#97552F")
    TempVars!AlternateColor = Nz(rs!AlternateColor.Value, "#1736SD")
    TempVars!ServiceAccount = Nz(rs!CompanyServiceAccount.Value, 0)
    TempVars!Location = Nz(rs!CenterID.Value, 0)
    TempVars!Hub = Nz(rs!Hub.Value, 0)
    TempVars!MaxWeight = Nz(rs!MaxWeight.Value, 0)
    TempVars!QBAR = Nz(rs!AccountRecievable.Value, "")
    TempVars!QBTemplate = Nz(rs!InvoiceTemplate.Value, "")
    TempVars!CompanyTaxName = Nz(rs!CompanyTaxName, "")
    TempVars!DunnageWeight = Nz(rs!DunnageWeight, 0)
    TempVars!MoffetWeight = Nz(rs!MoffetWeight, 0)
    TempVars!Longitude = Nz(rs!Longitude, 0)
    TempVars!Latitude = Nz(rs!Latitude, 0)
    TempVars!LocationButtons = rs!UseLocationButtons.Value
End If
    
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basThisApp.GetCompanyAddress"
    Resume PROC_EXIT


End Function