Option Compare Database

Public strSQL As String
Public iCount As Integer
Public dblDecimal As Double

Declare PtrSafe Function LockWindowUpdate Lib "user32" (ByVal hwnd As Long) As Long

Public Enum SecurityLevel
    NoAccess = 0
    FullAccess = 1
    ViewOnly = 2
    ViewAndReports = 3
    RestrictedAccess = 4
End Enum
Public Function UndoRecord(frm As Form)
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 08/28/20 08:03 AD
    ' Modified:
    
    
    On Error Resume Next
    
    Dim ctlC As Control
 ' For each control.
    For Each ctlC In frm.Detail.Controls
        If ctlC.ControlType = acTextBox Or ctlC.ControlType = acCheckBox Or ctlC.ControlType = acComboBox Then
        'Restore Old Value.
        ctlC.Value = ctlC.OldValue
        End If
    Next ctlC
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basWSIFunctions.UndoRecord"
    Resume PROC_EXIT



End Function
Public Function FirstDayYear() As Date
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 07/20/20 08:38 AD
    ' Modified:
    
    
  On Error GoTo PROC_ERR
    
FirstDayYear = DateSerial(Year(Date), 1, 1)
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basWSIFunctions.FirsDayYear"
    Resume PROC_EXIT



End Function
Public Function LastDayYear() As Date
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 07/20/20 08:38 AD
    ' Modified:
    
    
  On Error GoTo PROC_ERR
    
LastDayYear = DateSerial(Year(Date), 12, 31)
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basWSIFunctions.FirsDayYear"
    Resume PROC_EXIT



End Function


Public Function QuarterLastDay(ByVal datIn As Date) As Date
  ' Comments: Get the last day of the quarter for a given date. Quarters end at the end of March, June, September, and December.
  ' Params  : datIn         Date to test
  ' Returns : Date of the last day of the quarter
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  Dim dbl As Double
  
  dbl = (Month(datIn) - 1) / 3
  
  QuarterLastDay = DateSerial(Year(datIn), Int(dbl) * 3 + 4, 0)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.QuarterLastDay"
  Resume PROC_EXIT
End Function

Public Function MonthFirstDay(ByVal dMonth As Date, ByVal dYear As Date) As Date
  ' Comments: Get the first day of the month.
  ' Params  : intMonth    Number of the month (1-12)
  '           intYear     Year to check; Always specify the full four digits of the year.
  ' Returns : Date of the first day of the month
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  MonthFirstDay = DateSerial(Year(dYear), Month(dMonth), 1)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.MonthFirstDay"
  Resume PROC_EXIT
End Function
Public Function MonthLastDay(ByVal dMonth As Date, ByVal dYear As Date) As Date
  ' Comments: Get the last day of the month.
  ' Params  : intMonth    Number of the month (1-12)
  '           intYear     Year (necessary for calculating leap years). Always specify the full four digits of the year.
  ' Returns : Last day of the month
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  Dim dGetMonth As Date
  
  dGetMonth = Month(dMonth)
  MonthLastDay = DateSerial(Year(dYear), dGetMonth + 1, 0)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.MonthLastDay"
  Resume PROC_EXIT
End Function
Public Function QuarterFirstDay(ByVal datIn As Date) As Date
  ' Comments: Get the first day of the quarter for a given date. Quarters start at the beginning of January, April, July, and October.
  ' Params  : datIn         Date to test
  ' Returns : First day of the quarter
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  Dim dbl As Double
  
  dbl = (Month(datIn) - 1) / 3
  
  QuarterFirstDay = DateSerial(Year(datIn), Int(dbl) * 3 + 1, 1)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.QuarterFirstDay"
  Resume PROC_EXIT
End Function
Public Function DoEmailOutlook(sTo As String, sSubject As String, sBody As String, sFile As String, Optional bFileAttach As Boolean = False, Optional bPreview As Boolean = False) As Boolean
On Error GoTo doEmailOutlookErr

Dim strEmail As String
Dim strMsg As String
Dim oLook As Object
Dim oMail As Object

If Nz(sTo, "") = "" Then
    MsgBox "You need to enter the recipient's e-mail address"
    Exit Function
End If

Set oLook = CreateObject("Outlook.Application")
Set oMail = oLook.createitem(0)
With oMail
    '.ReplyRecipients.Add "YourEmail@YourDomain.com"
    .To = sTo
    .body = sBody
    '.htmlbody = sBody
    .Subject = sSubject
    If sFile <> "" Then
        .Attachments.Add (sFile)
    End If
    If bFileAttach = True Then
        .Attachments.Add (CurrentProject.path & "\YourFile.pdf")
    End If
    If bPreview = True Then
        .Display
    Else
        .Send
    End If
End With

If bPreview = False Then
    Set oMail = Nothing
    Set oLook = Nothing
End If

DoEmailOutlook = True

Exit Function

doEmailOutlookErrExit:
    Exit Function

doEmailOutlookErr:
    If Err.Number = 429 Then
        MsgBox "You must have Outlook installed on the computer you are running this code for it to work!", vbOKOnly, "Outlook Installed?"
    Else
        MsgBox Err.Description, vbOKOnly, Err.Source & ":" & Err.Number
        DoEmailOutlook = False
    End If
    Resume doEmailOutlookErrExit
End Function
Public Function DoAddDocument(Optional ctl As Control, Optional bExcel As Boolean, Optional bCSV As Boolean, Optional bAll As Boolean) As String
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 05/03/17 10:10 A
    ' Modified:
    
    On Error GoTo PROC_ERR
Dim fd As Object
Dim sPath As Variant
Dim sPathFull As String
Dim sFileName As String

Const msoFileDialogPicker = 3
Set fd = Application.FileDialog(msoFileDialogPicker)
    With fd
        ' Set the title of the dialog box.
        .Title = "Select One File"
        .AllowMultiSelect = False
        If Nz(ctl, "") <> "" Then .InitialFileName = ctl
        .Filters.Clear
        .Filters.Add "Picture Files", "*.jpg; *.png; *.gif; *.bmp; *.jpeg"
        .Filters.Add "PDF Files", "*.PDF; *.PDFx"
        .Filters.Add "All Files", "*.*"
        
        If bExcel = True Then
            .Filters.Clear
            .Filters.Add "Excel Files", "*.xls; *.xlsx"
        End If
        
        If bCSV = True Then
            .Filters.Clear
            .Filters.Add "CSV File", "*.csv;*.txt"
            .Filters.Add "All Files", "*.*"
        End If
        
        If bAll = True Then
            .Filters.Clear
            .Filters.Add "All Files", "*.*"
        End If
        
        ' Show the dialog box. If the .Show method returns True, the
        ' user picked at least one file. If the .Show method returns
        ' False, the user clicked Cancel.
        If .Show = True Then
            For Each sPath In .SelectedItems
                sPathFull = sPath
                'sFileName = GetFilenameFromPath(sPathFull)
            Next sPath
           ' Me.txtFileName = sFileName
            DoAddDocument = Nz(sPathFull, "")
        Else
            MsgBox "You clicked Cancel in the file dialog box."
            DoAddDocument = ""
        End If
    End With
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "modWSI.doAddDocument"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd
End Function
Public Function DoRequired(frm As Form, Optional skipSubform = False) As Boolean
    ' Comments: Function returns all fields required that are blank
    '           it uses the tag property must enter in tag property the following
    '           without quotes "required;Named to be Displayed"
    ' Params  :
    ' Returns : Variant
    ' Created : 09/25/14 14:37 AD
    ' Modified:
    
'On Error GoTo PROC_ERR


'loop through a form and find textboxes and combo boxes that have
'the on tag property the word required
'if required it means it can not be left blank it needs a value

Dim txt As Control
Dim txtSub As Control
Dim strMsg As String
Dim intResponse As Integer
strMsg = vbNullString
Dim getTag As String

' loop and check if control is textbox or combo box also if tag = required
' then check if the control is null if is null add to string the field names
For Each txt In frm.Controls
    getTag = vbNullString
    If txt.Tag <> vbNullString Then getTag = Left(txt.Tag, 8)
    If (txt.ControlType = acTextBox Or txt.ControlType = acComboBox Or txt.ControlType = acListBox) And getTag = "required" Then
        If Nz(txt, "") = vbNullString Then
            getTag = Mid(txt.Tag, (InStr(txt.Tag, ";") + 1))
            strMsg = strMsg + getTag + ", " & vbCrLf
        End If
    End If
    If txt.ControlType = acSubform And skipSubform = False Then
        For Each txtSub In txt.Form.Controls
            If txtSub.Tag <> vbNullString Then getTag = Left(txtSub.Tag, 8)
            If (txtSub.ControlType = acTextBox Or txtSub.ControlType = acComboBox Or txtSub.ControlType = acListBox) And getTag = "required" Then
                If Nz(txtSub, "") = vbNullString Then
                    getTag = Mid(txtSub.Tag, (InStr(txtSub.Tag, ";") + 1))
                    strMsg = strMsg + getTag + ", " & vbCrLf
                End If
            End If
        Next
    End If
Next

' if strmsg came out empty it means all fields were filled return TRUE in function and exit

If strMsg = vbNullString Then
    DoRequired = True
    Exit Function
End If

' if it came to this part it means there's empty fields, give message with field list
' also return function false

intResponse = MsgBox("The following field(s) are required to proceed:" & vbCrLf & vbCrLf _
        & Mid(strMsg, 1, (Len(strMsg) - 4)) & "." & vbCrLf & vbCrLf & _
        "Click OK to proceed to enter the missing information, else cancel and close the record", vbInformation + vbOKOnly, "Required Field Validation Failed")

DoRequired = False




PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "mdlBasics.dRequired"
    Resume PROC_EXIT

End Function
Public Function doSearch(frm As Form, strSource As String, Optional strSort As String, Optional bQDef As Boolean = False, Optional bExport As Boolean = False)

    ' Comments:
    ' Params  :
    ' Returns : Double
    ' Created : 01/22/20 13:55 A
    ' Modified:
    
    On Error GoTo PROC_ERR
Dim ctl As Control, sql As String, sqlWhere As String



For Each ctl In frm.FormHeader.Controls
    If (ctl.ControlType = acTextBox Or ctl.ControlType = acComboBox) And ctl.Tag <> "Skip" Then
        If Nz(ctl, "") <> "" Then
            sqlWhere = sqlWhere & "And " & Mid(ctl.Name, 4) & " Like '*" & CStr(ctl) & "*' "
        End If
    End If
    
    If ctl.Name = "chkIsActive" Then
        If ctl = False Then
            sqlWhere = sqlWhere & "And " & Mid(ctl.Name, 4) & " = True "
        End If
    End If
Next



sql = "Select * from " & strSource & " "

If Nz(sqlWhere, "") <> "" Then
    If Left(sqlWhere, 3) = "And" Then
        sqlWhere = Mid(sqlWhere, 4, Len(sqlWhere) - 3)
    End If
    sql = sql & " Where " & sqlWhere
End If


If Nz(strSort, "") <> "" Then sql = sql & " Order By " & strSort

TempVars!Where = " Where " & Replace(sqlWhere, "Name", "[Name]")


doSearch = sql


If bQDef = True Then
    Dim db As dao.Database, qdf As QueryDef
    Set db = CurrentDb
    Set qdf = db.QueryDefs("qrySearchResults")
    qdf.sql = sql
    If bExport = True Then ExportXLS ("qrySearchResults")
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basWSIFunctions.Search"
    Resume PROC_EXIT
    
End Function
Public Function Markup(SalesPrice As Double, unitCost As Double) As Double
    ' Comments:
    ' Params  :
    ' Returns : Double
    ' Created : 01/21/20 10:49 A
    ' Modified:
    
    On Error GoTo PROC_ERR

Dim grossProfit As Double

grossProfit = SalesPrice - unitCost

If grossProfit > 0 And unitCost > 0 Then
    Markup = grossProfit / unitCost
Else
    Markup = 0
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basWSIFunctions.Markup"
    Resume PROC_EXIT

End Function

Public Function Margin(SalesPrice As Double, unitCost As Double) As Double
    ' Comments:
    ' Params  :
    ' Returns : Double
    ' Created : 01/21/20 10:49 A
    ' Modified:
    
    On Error GoTo PROC_ERR

Dim grossProfit As Double

grossProfit = SalesPrice - unitCost

If grossProfit > 0 And unitCost > 0 Then
    Margin = grossProfit / SalesPrice
Else
    Margin = 0
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basWSIFunctions.Markup"
    Resume PROC_EXIT

End Function

Function NotInListMsg() As Single
' Comments:
' Params  :
' Returns : String
' Created : 05/16/19 08:33 A
' Modified:
    
    On Error GoTo PROC_ERR
    MsgBox "Please select a value from the list!", vbInformation, "Value not in List"
    NotInListMsg = 0

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "modThisApp.notInListMsg"
    Resume PROC_EXIT


End Function
Public Function backOrderDisplay(frm As Form, strOrder As String)
    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 10/04/19 15:16 A
    ' Modified:
    
   ' On Error GoTo PROC_ERR
Dim bBO As Boolean

If isBackOrder(strOrder) = True Then bBO = True Else bBO = False

    frm!lbBO.Visible = bBO
    frm!BackOrderDueDate.Visible = bBO
    frm!lbRec.Visible = bBO
    frm!Received.Visible = bBO
    frm!DateReceived.Visible = bBO


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basWSIFunctions.backOrderDisplay"
    Resume PROC_EXIT

End Function

Public Function isBackOrder(strOrder As String) As Boolean
    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 10/04/19 15:12 A
    ' Modified:
    
    On Error GoTo PROC_ERR

If Right(strOrder, 2) = "BO" Then isBackOrder = True Else isBackOrder = False


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "basWSIFunctions.isBackOrder"
    Resume PROC_EXIT
End Function
Public Function doDropSheet(lngID As Long)
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 03/05/18 13:29 A
    ' Modified:
    
    On Error GoTo PROC_ERR
Dim iCountAll As Integer, iCount As Integer

iCountAll = Nz(DCount("*", "qryDropSheet", "DropSheetID=" & Nz(lngID, 0)), 0)

'check if nothing is in BO
iCount = Nz(DCount("*", "qryDropSheet", "DropSheetID=" & Nz(lngID, 0) & " And fkBackOrderID Is Null"), 0)

If iCountAll = iCount Then
    DoCmd.OpenReport "rptDropSheetMain", acViewPreview, , "DropSheetID=" & lngID
    Report_rptDropSheetMain.RecordSource = "qryDropSheet"
    Exit Function
End If

'check if BO
iCount = Nz(DCount("*", "qryDropSheet", "DropSheetID=" & Nz(lngID, 0) & " And fkBackOrderID=1"), 0)

If iCount > 0 Then
DoCmd.OpenReport "rptDropSheetMain", acViewPreview, , "DropSheetID=" & lngID
Report_rptDropSheetMain.rptSubBox.Report.RecordSource = "Select * from qryBox Where fkBackOrderID Is Null or fkBackOrderID=0"
Report_rptDropSheetMain.rptSubPanel.Report.RecordSource = "Select * from qryPanel Where fkBackOrderID Is Null or fkBackOrderID=0"
Report_rptDropSheetMain.rptSubTrim.Report.RecordSource = "Select * from qryTrim Where fkBackOrderID Is Null or fkBackOrderID=0"
Exit Function
End If


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT


End Function
Public Function doToolBar(intTool As Integer)
On Error Resume Next
If Environ("UserName") <> "andresdominicci" Then DoCmd.ShowToolbar "Ribbon", intTool   'Hides the full toolbar
End Function
Public Function doDelete(frm As Form, Optional confirm As Boolean = False) As Boolean
    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 04/14/16 14:00 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    
    
If frm.NewRecord Then
    frm.Undo
    doDelete = False
ElseIf confirm = False Then
    DoCmd.SetWarnings False
    DoCmd.RunCommand acCmdDeleteRecord
    DoCmd.SetWarnings True
    doDelete = False
ElseIf confirm = True Then
    If MsgBox("Are you sure you want to delete this record? This action can not be undone!", vbQuestion + vbYesNo, "Delete?") = vbYes Then
        DoCmd.SetWarnings False
        DoCmd.RunCommand acCmdDeleteRecord
        DoCmd.SetWarnings True
        doDelete = True
    End If
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function
Public Function doLoadNumber(lngID As Long, dLoadDate As Date) As String
Dim db As dao.Database
Dim rs As dao.Recordset
Dim strSQL As String
Set db = CurrentDb



End Function
Function RunPassThrough(strSQL As String, bReturn As Boolean, Optional strQuery As String = "qryPassThrough", Optional bSQL As Boolean = False) As Boolean

On Error GoTo Err_Rout

Dim qdfPassThrough As dao.QueryDef, myDB As Database
Dim strConnect As String



DoCmd.SetWarnings False
If Not IsNull(CurrentDb.QueryDefs(strQuery).sql) Then 'doesn't exist
CurrentDb.QueryDefs.Delete strQuery
End If

Set myDB = CurrentDb()

Set qdfPassThrough = myDB.CreateQueryDef(strQuery)


If bSQL = False Then
    strConnect = wsiSQLConnectString
Else
    strConnect = "DSN=Connex;DATABASE=connex;SERVER=192.168.1.145;PORT=5432;UID=guest;CA=d;A6=;A7=100;A8=4096;B0=255;B1=8190;BI=0;C2=dd_;;CX=1c8902bb;A1=7.4-1"
End If
qdfPassThrough.Connect = "ODBC;" & strConnect


qdfPassThrough.sql = strSQL
qdfPassThrough.ReturnsRecords = bReturn
qdfPassThrough.Close

'DoCmd.OpenQuery "qrySQLPass", acViewNormal, acReadOnly
DoCmd.SetWarnings True
RunPassThrough = True

Set db = Nothing

Exit Function

Err_Rout:


    RunPassThrough = False
    MsgBox "Error Number: " & Err.Number & ". " & Err.Description, vbCritical, "Error"
    DoCmd.SetWarnings True

End Function

Function doInsertUser()
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 05/05/17 13:21 A
    ' Modified:
    
    On Error Resume Next
Dim cmd As ADODB.Command
Set cmd = New ADODB.Command

Dim str1 As String, str2 As String

If TempVars!UserType <> "AK" Then Exit Function

str1 = "wsi"
str2 = "com"
str1 = "DAKOTASTEEL"
str2 = "com"

strSQL = "Insert into dbo.tblUser (UserType,UserName) SELECT  tblADSI.wWWHomePage as UserType, tblADSI.sAMAccountName as ADuser "
strSQL = strSQL & "FROM OPENQUERY(ADSI, 'SELECT name, sAMAccountName,  wWWHomePage FROM ''LDAP://DC=" & str1 & ",DC=" & str2 & "'' WHERE objectClass = ''User'' ') AS tblADSI "
strSQL = strSQL & "Where tblADSI.wwwHomePage = 'AK' or tblADSI.wwwHomePage Is Null"

cmd.ActiveConnection = wsiSQLConnectString
cmd.CommandType = adCmdStoredProc
cmd.CommandText = "InsPeople"
cmd.Execute

PROC_EXIT:
    
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd

End Function
Public Function doExport(strQuery As String, intType As Integer, Optional strWhere As String = "", Optional strReport As String)
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 06/15/17 13:46 A
    ' Modified:
    
    On Error GoTo PROC_ERR
Dim db As dao.Database
Dim qdf As QueryDef
Dim strPath As String
Set db = CurrentDb
Set qdf = db.QueryDefs("qrySearchResults")
strSQL = "Select * from " & strQuery
If Len(strWhere) > 0 Then
    strSQL = strSQL & " Where " & strWhere
End If

qdf.sql = strSQL

strPath = CurrentProject.path & "\Temp-" & Format(Now, "mmmddyyyy-hmmss")

Select Case intType
    Case 1
        DoCmd.OutputTo acOutputQuery, "qrySearchResults", acFormatXLS, strPath & ".xls", True
    Case 2
        DoCmd.OpenReport strReport, acViewPreview
        DoCmd.OutputTo acOutputReport, "", acFormatPDF, strPath & ".pdf", True
        DoCmd.Close acReport, strReport, acSaveNo
End Select

Set db = Nothing
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd
End Function

Function FileExists(ByVal strFile As String, Optional bFindFolders As Boolean) As Boolean
    'Purpose:   Return True if the file exists, even if it is hidden.
    'Arguments: strFile: File name to look for. Current directory searched if no path included.
    '           bFindFolders. If strFile is a folder, FileExists() returns False unless this argument is True.
    'Note:      Does not look inside subdirectories for the file.
    'Author:    Allen Browne. http://allenbrowne.com June, 2006.
    Dim lngAttributes As Long

    'Include read-only files, hidden files, system files.
    lngAttributes = (vbReadOnly Or vbHidden Or vbSystem)

    If bFindFolders Then
        lngAttributes = (lngAttributes Or vbDirectory) 'Include folders as well.
    Else
        'Strip any trailing slash, so Dir does not look inside the folder.
        Do While Right$(strFile, 1) = "\"
            strFile = Left$(strFile, Len(strFile) - 1)
        Loop
    End If

    'If Dir() returns something, the file exists.
    On Error Resume Next
    FileExists = (Len(Dir(strFile, lngAttributes)) > 0)
End Function
Public Sub OpenUrl(strLink As String)

    Dim lSuccess As Long
 '   lSuccess = ShellExecute(0, "Open", strLink)

End Sub

Public Function doLock(frm As Form)
    frm.AllowEdits = False
    frm!cmdEdit.Visible = True
    frm!cmdEdit.SetFocus
    frm!cmdLock.Visible = False
End Function




Public Function doEdit(frm As Form)
    frm.AllowEdits = True
    frm.AllowAdditions = True
    frm!cmdLock.Visible = True
    frm!cmdLock.SetFocus
    frm!cmdEdit.Visible = False
End Function
Public Function dRequired(frm As Form) As Integer
    ' Comments: Function returns all fields required that are blank
    '           it uses the tag property must enter in tag property the following
    '           without quotes "required;Named to be Displayed"
    ' Params  :
    ' Returns : Variant
    ' Created : 09/25/14 14:37 AD
    ' Modified:
    
On Error GoTo PROC_ERR


'loop through a form and find textboxes and combo boxes that have
'the on tag property the word required
'if required it means it can not be left blank it needs a value

Dim txt As Control
Dim strMsg As String
Dim intResponse As Integer
strMsg = vbNullString
Dim getTag As String

' loop and check if control is textbox or combo box also if tag = required
' then check if the control is null if is null add to string the field names
For Each txt In frm.Controls
    
    getTag = vbNullString
    If txt.Tag <> vbNullString Then getTag = Left(txt.Tag, 8)
    If (txt.ControlType = acTextBox Or txt.ControlType = acComboBox) And getTag = "required" Then
        If Nz(txt, "") = vbNullString Then
            getTag = Mid(txt.Tag, (InStr(txt.Tag, ";") + 1))
            strMsg = strMsg + getTag + ", " & vbCrLf
        End If
    End If
Next

' if strmsg came out empty it means all fields were filled return TRUE in function and exit

If strMsg = vbNullString Then
    dRequired = 1
    Exit Function
End If

' if it came to this part it means there's empty fields, give message with field list
' also return function false

intResponse = MsgBox("The following information is required to continue:" & vbCrLf & vbCrLf _
        & Mid(strMsg, 1, (Len(strMsg) - 4)) & "." & vbCrLf & vbCrLf & _
        "Would you like to complete the information? Press OK to continue, Cancel to cancel the changes", vbInformation + vbOKCancel + vbDefaultButton1, "Missing Information")
If intResponse = vbCancel Then
    dRequired = 2
Else
    dRequired = 3
End If



PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function

Public Function RelinkSQLTablesOld()
    'TVCodeTools ErrorEnablerStart
On Error GoTo PROC_ERR
    'TVCodeTools ErrorEnablerEnd

    'TVCodeTools ErrorHandlerStart

Dim db As Database
Set db = CurrentDb
Dim tdef As TableDef
Dim constr As Variant
'devel Connection string
'constr = "ODBC;DRIVER=SQL Server;SERVER=65.120.138.5,1400;DATABASE=dbZFContact;uid=ZFUser;pwd=!9900!~"
'constr = "ODBC;DRIVER=SQL Server;SERVER=JE_2011_WIN7\SQLEXPRESS;DATABASE=dbZFContact;uid=ZFUser;pwd=!9900!~"
'constr = "ODBC;DRIVER=SQL Server;SERVER=LIGIA-HP\SQLEXPRESS;DATABASE=dbZFContact;uid=sa;pwd=ogbeyonu83"
'constr = "ODBC;DRIVER=SQL Server;SERVER=WIN-DVDU7BN12IF\SQLEXPRESS;DATABASE=dbZFContact;uid=sa;pwd=ogbeyonu83"
'constr = "ODBC;DRIVER=ODBC DRIVER 13 for SQL SERVER;SERVER=DESKTOP-S1MQ7GE\SQLSERVER2016;DATABASE=dbSRCApp;uid=sa;pwd=ogbeyonu83"
'Live connection string
constr = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=gcr98z4p7o.database.windows.net;DATABASE=db_cdc13ded_17bd_48f6_8e64_4eb565514cdd;uid=db_cdc13ded_17bd_48f6_8e64_4eb565514cdd_ExternalWriter;pwd=pdc2uSw48-$i4.>"

'constr = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=SUPERSONIC;DATABASE=dbSRCApp;uid=sq;pwd=SquidW@rd"

For Each tdef In db.TableDefs
If InStr(tdef.Connect, "ODBC") Then
    If tdef.Connect <> constr Then
        tdef.Connect = constr
        tdef.RefreshLink
    End If
End If
Next

Set db = Nothing
Set tdef = Nothing
PROC_EXIT:
    Exit Function

PROC_ERR:
If Err.Number = 3011 Then
    Resume Next
Else
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End If


End Function
Public Function CheckDomain(strDomain As String) As Boolean
  ' Comments: Verifies the domain portion of an email address (text after the @ symbol)
  '           Based on this required format: No spaces, must have a "." but can't start or end with it.
  '           Only letters, numbers, ".", and "-" allowed.
  ' Params  : strDomain           Domain address to check
  ' Returns : TRUE if okay (including ""), FALSE if not
  
  
    On Error GoTo PROC_ERR
  
  Dim fOK As Boolean
  Dim intChar As Integer
  Dim strChar As String
  
  fOK = False
  
  If Len(strDomain) >= 4 Then
    ' Email cannot be less than 4 chars
    If InStr(strDomain, " ") = 0 Then
      ' String can't have spaces
      If (InStr(strDomain, ".") > 1) Then
        ' . can't be the first character
        ' . must follow the "@" by at least one character (i.e. domain must have at least one character before the .xyz)
        
        If Right$(strDomain, 1) <> "." Then
          ' Can't end with a .
          
          ' Check for any invalid characters in domain
          fOK = True
          For intChar = 1 To Len(strDomain)
            strChar = Mid$(strDomain, intChar, 1)
            
            ' Only letters, numbers, and hyphens allowed
            Select Case strChar
              Case "A" To "Z", "a" To "z", "-", "."
              Case "0" To "9"
              Case Else
                fOK = False
                Exit For
            End Select
          Next intChar
          
        End If
      End If
    End If
  End If
  
  CheckDomain = fOK
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function
Public Function CheckEmailName(strName As String) As Boolean
  ' Comments: Verifies the name portion of an email address (text before the @ symbol)
  ' Params  : strName             Name portion of the email address to check
  ' Returns : TRUE if okay , FALSE if not
  
  
    On Error GoTo PROC_ERR
  
  Dim fOK As Boolean
  
  fOK = False
  
  If strName <> "" Then
    ' Email name portion can't have spaces or the @ character
    If InStr(strName, " ") + InStr(strName, "@") = 0 Then
      ' Email address cannot have embedded CR or LF
      fOK = (InStr(strName, vbCr) + InStr(strName, vbLf) = 0)
    End If
  End If
  
  CheckEmailName = fOK
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modEmailValidation.CheckEmailName"
    Resume PROC_EXIT
End Function
Public Function GetEmailParts(ByVal strEmail As String, ByRef strFriendlyName As String, ByRef strName As String, ByRef strDomain As String) As Boolean

  ' Comments: Gets the three component parts of an email (<friendly name> name@website.com) or (friendly name <name@website.com>)
  ' Params  : strEmail            Email address to check
  ' Sets    : strFriendlyName     The friendly name, if any
  '           strName             Who the mail is to (name before @)
  '           strDomain           Domain the email is being sent to (webisite.com)
  ' Returns : TRUE if parts found, FALSE if not


    On Error GoTo PROC_ERR

  Const cstrDelimClose As String = ">)]"""
  Const cstrDelimOpen As String = "<(["""

  Dim fOK As Boolean
  Dim intLastAt As Integer
  Dim intDelimCounter As Integer
  Dim strDelimChar As String
  Dim strBeginDelim As String
  Dim intBeginDelim As Integer
  Dim strEndDelim As String
  Dim intEndDelim As Integer
  Dim fEndWithDelim As Boolean
  Dim strBrackets As String
  Dim strRemain As String

  fOK = True

  strEmail = Trim$(strEmail)

  intLastAt = InStrRev(strEmail, "@")

  If intLastAt = 0 Then
    ' Must have at least one @ sign
    fOK = False
  Else
    ' Initialize
    fEndWithDelim = False
    strBrackets = ""
    strRemain = ""

    ' Get Everything after last @
    strDomain = Mid$(strEmail, intLastAt + 1)
    strName = Mid$(strEmail, 1, intLastAt - 1)

    ' If it ends with >)]", then is has friendly name at end
    For intDelimCounter = 1 To Len(cstrDelimClose)
      strDelimChar = Mid$(cstrDelimClose, intDelimCounter, 1)
      If Right$(strEmail, 1) = strDelimChar Then
        ' Got a match
        fEndWithDelim = True
        strBeginDelim = Mid$(cstrDelimOpen, intDelimCounter, 1)
        intBeginDelim = InStrRev(strEmail, strBeginDelim, Len(strEmail) - 1)

        ' Handle email with trailing " and no other "
        If intBeginDelim > 0 Then
          strBrackets = Mid$(strEmail, intBeginDelim + 1, Len(strEmail) - intBeginDelim - 1)
          strRemain = Trim$(Left$(strEmail, intBeginDelim - 1))
        End If

        Exit For
      End If
    Next intDelimCounter

    ' If we didn't find a delim at end, check beginning. Handles when fOK is false
    If Not fEndWithDelim Then
      For intDelimCounter = 1 To Len(cstrDelimOpen)
        strDelimChar = Mid$(cstrDelimOpen, intDelimCounter, 1)
        If Left$(strEmail, 1) = strDelimChar Then
          strEndDelim = Mid$(cstrDelimClose, intDelimCounter, 1)
          intEndDelim = InStr(strEmail, strEndDelim)

          strBrackets = Mid$(strEmail, 2, intEndDelim - 2)
          strRemain = Trim$(Right$(strEmail, Len(strEmail) - intEndDelim))

          Exit For
        End If
      Next intDelimCounter
    End If

    If strBrackets <> "" Or strRemain <> "" Then
      If InStr(strBrackets, "@") > 0 Then
        intLastAt = InStrRev(strBrackets, "@")
        strDomain = Mid$(strBrackets, intLastAt + 1)
        strName = Mid$(strBrackets, 1, intLastAt - 1)
        strFriendlyName = strRemain
      ElseIf InStr(strRemain, "@") > 0 Then
        intLastAt = InStrRev(strRemain, "@")
        strDomain = Mid$(strRemain, intLastAt + 1)
        strName = Mid$(strRemain, 1, intLastAt - 1)
        strFriendlyName = strBrackets
      Else
        fOK = False
      End If
    End If
  End If

  GetEmailParts = fOK

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modEmailValidation.GetEmailParts"
    Resume PROC_EXIT
End Function
Public Function IsEmailOK(ByVal strEmail As String) As Boolean
  ' Comments: Determine if one Email address is okay.
  '           Email can be simply "name@fmsinc.com" or include a friendly name "<My Name> name@fmsinc.com" with either part in brackets
  ' Params  : strEmail            Email address to check
  ' Returns : TRUE if okay (including ""), FALSE if not
  
  
    On Error GoTo PROC_ERR
  
  Dim fOK As Boolean
  Dim strFriendlyName As String
  Dim strName As String
  Dim strDomain As String
  
  fOK = False
  
  ' Break the email into its parts and test them separately
  If GetEmailParts(strEmail, strFriendlyName, strName, strDomain) Then
    ' Verifh the name part is valid
    If CheckEmailName(strName) Then
      ' Verify the domain part is valid
      fOK = CheckDomain(strDomain)
    End If
  End If
  
  IsEmailOK = fOK
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modEmailValidation.IsEmailOK"
    Resume PROC_EXIT

End Function

Public Function IsObjectOpen(eObjectType As AcObjectType, ByVal strName As String) As Boolean
  ' Comments: Determines if the named Access object is open
  ' Params  : eObjectType       Access object type (acTable, acQuery etc.)
  '           strName           Object name to check
  ' Returns : True if the object is open, or False otherwise
  
    On Error GoTo PROC_ERR
  
  IsObjectOpen = (SysCmd(acSysCmdGetObjectState, eObjectType, strName) <> 0)
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modObjects.IsObjectOpen"
    Resume PROC_EXIT
End Function
Public Function addToList(ByVal tbl As String, ByVal fld As String, ByVal str As String, Optional ByVal strForm As String, Optional ByVal strKey As String) As Integer
'if is not in list, ask to add it
On Error GoTo NotInList_Err
    Dim intAnswer As Integer
    Dim strSQL As String
   
    intAnswer = MsgBox(str & _
        " is not currently listed." & vbCrLf & _
        "Would you like to add it to the list now?" _
        , vbQuestion + vbYesNo, "Add to List")
    If intAnswer = vbYes Then
        strSQL = "INSERT INTO " & tbl & " (" & fld & ") VALUES ('" & wsiGetCorrectString(str) & "');"
        'Debug.Print strSQL
        CurrentDb.Execute strSQL, dbSeeChanges
        Dim rs As dao.Recordset
        Dim lngID As Long
        Dim strWhere As String
        Set rs = CurrentDb.OpenRecordset("Select @@identity")
        lngID = rs(0)
        
        MsgBox str & " has been added to the list." _
            , vbInformation, "Add It"
        addToList = 2
    Else
        MsgBox "Please choose from the list." _
            , vbInformation, "Not in List"
        addToList = 0
        Exit Function
    End If
    If Nz(strForm, "") <> "" Then
        strWhere = strKey & "=" & lngID
        DoCmd.OpenForm strForm, acNormal, , strWhere
    End If
Set db = Nothing
NotInList_Exit:
    Exit Function
NotInList_Err:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume NotInList_Exit

End Function




Public Function RelinkTablesToAccess() As Boolean
'When the program starts this routine is call from the AutoExec Macro
'it will make sure that data is available
'if not it will open dialog box to locate data file

' define variables use DAO instead of ADO
    Dim rst As dao.Recordset
    Dim intNumTables As Integer
    Dim varReturn As Variant
    Dim intI As Integer
    Dim tdf As TableDef
    Dim fd As Object
    Dim vrtSelectedItem As Variant
    Dim sFileName As String
    Dim tableName As String
    Dim strFile As String
    On Error Resume Next
    Const msoFileDialogOpen = 1
    'Try to open Category table to make sure it exist, if error it will go to if statement and reattach tables
    
    Set rst = CurrentDb.OpenRecordset("tblClients", dbOpenDynaset)
    
    'check for failure - the link must be bad.
    If Err <> 0 Then
OnBadFile:
        'get the new location
        Set fd = Application.FileDialog(msoFileDialogOpen)
        fd.Title = "Please select SRCApp_BE.accdb file:"
        fd.Filters.Clear
        fd.Filters.Add "Access Databases", "*.accdb"
        fd.InitialFileName = CurrentProject.path
        If fd.Show = True Then
            For Each vrtSelectedItem In fd.SelectedItems
                sFileName = vrtSelectedItem
            Next
        End If
        
        'extract filename path
        strFile = Right(sFileName, Len(sFileName) - InStrRev(sFileName, "\"))
        
        If strFile <> "SRCApp_BE.accdb" Then
            If MsgBox("Please locate SRCApp_BE.accdb. If want to exit the database please click on Cancel", vbRetryCancel + vbCritical, "Incorrect Selection") = vbRetry Then
                ' go back and show open dialog box
                GoTo OnBadFile
            Else
                'get out of access
                Application.Quit
            End If
        End If
        
        'Rebuild the links.  Check for the number of tables first
        intNumTables = CurrentDb.TableDefs.Count
        varReturn = SysCmd(acSysCmdInitMeter, "Relinking tables", intNumTables)
        
        'Loop through all tables.  Reattach those with nonzero-length Connect strings
        intI = 0
        For Each tdf In CurrentDb.TableDefs
        
            'if connect is blank, it's not a linked table
            If Len(tdf.Connect) > 0 Then
            
                intI = intI + 1
                'tdf.Connect = ";DATABASE=" & sFileName
                CurrentDb.TableDefs.Delete tdf.Name
                
                tableName = tdf.Name
                
                Set tdf = CurrentDb.CreateTableDef(tableName)
                tdf.Connect = ";DATABASE=" & sFileName
                tdf.SourceTableName = tableName
                tdf.RefreshLink
                CurrentDb.TableDefs.Append tdf
                
            End If
            
            varReturn = SysCmd(acSysCmdUpdateMeter, intI)
            
        Next tdf
        
        varReturn = SysCmd(acSysCmdRemoveMeter)
        
    End If
    RelinkTablesToAccess = True
End Function


Public Function dMaxForm()

' maximize form

DoCmd.Maximize
End Function
Public Function dRequiredAll(frm As Form) As Boolean
    ' Comments: Check for required fields in forms
    
    ' Params  :
    ' Returns : Variant
    ' Created : 10/08/14 13:08 AD
    ' Modified:
    
    On Error GoTo PROC_ERR

'loop through a form and find textboxes and combo boxes that have
'the on tag property the word required
'if required it means it can not be left blank it needs a value

Dim txt As Control
Dim strMsg As String
strMsg = vbNullString

' loop and check if control is textbox or combo box also if tag = required
' then check if the control is null if is null add to string the field names
For Each txt In frm.Controls
    If (txt.ControlType = acTextBox Or txt.ControlType = acComboBox) And txt.Tag = "required" Then
        If Nz(txt, "") = vbNullString Then
            strMsg = strMsg + txt.Name + ", "
        End If
    End If
Next

' if strmsg came out empty it means all fields were filled return TRUE in function and exit

If strMsg = vbNullString Then
    dRequiredAll = True
    Exit Function
End If


' if it came to this part it means there's empty fields, give message with field list
' also return function false
MsgBox "The following fields are required:" & vbCrLf _
        & strMsg, vbCritical, "Error"
    dRequiredAll = False
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd


End Function

Public Function SCCheck(frm As String)
    ' Comments: Check to see if theres a special consideration and display red line to capture attention of the user
    ' Params  :
    ' Returns : Boolean
    ' Created : 07/07/15 14:42 AD
    ' Modified:
    

    On Error GoTo PROC_ERR

Dim intC As Integer
Dim strForm As Form

Set strForm = Forms(frm)

intC = Nz(DCount("*", "tblSpecialConsideration", "fkLineDataID = " & Nz(strForm!LineDataID, 0)), 0)

If intC > 0 Then
    strForm!lbSC.Visible = True
Else
    strForm!lbSC.Visible = False
End If


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    

End Function
Public Function gFirstName(strName As String) As String

    ' Comments: Get first name from Name field
    ' Params  :
    ' Returns : string
    ' Created : 09/18/14 15:54 AD
    ' Modified:
    
    On Error GoTo PROC_ERR
    
    gFirstName = Left(strName, InStr(strName, " ") - 1)


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd


End Function
Public Function gLastName(strName As String) As String

    ' Comments: Get Last name from Name field
    ' Params  :
    ' Returns : string
    ' Created : 09/18/14 15:54 AD
    ' Modified:
    
    On Error GoTo PROC_ERR
    
    gLastName = Right(strName, Len(strName) - InStrRev(strName, " "))


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd
End Function



Public Function cAllObjects()

Debug.Print "Table count: " & CurrentDb.TableDefs.Count
Debug.Print "Query count: " & CurrentDb.QueryDefs.Count
Debug.Print "Form count: " & CurrentProject.AllForms.Count
Debug.Print "Report count: " & CurrentProject.AllReports.Count
Debug.Print "Macro count: " & CurrentProject.AllMacros.Count
Debug.Print "Module count: " & CurrentProject.AllModules.Count

End Function

Public Function IsLoaded(strForm) As Boolean

    ' Comments:
    ' Params  :
    ' Returns : Boleean
    ' Created : 10/16/15 14:09 AD
    ' Modified:
    
   On Error GoTo PROC_ERR
   
If CurrentProject.AllForms(strForm).IsLoaded = True Then
    IsLoaded = True
Else
    IsLoaded = False
End If


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT


End Function

Public Function FirstDayOfWeek(ByVal datIn As Date, Optional fDay As Integer = 1) As Date
  ' Comments: Get the first day (Sunday) of the week of a given date
  ' Params  : datIn         Date to check
  ' Returns : Date for the first Sunday of the given week
  
    On Error GoTo PROC_ERR
  
  FirstDayOfWeek = datIn - (Weekday(datIn, fDay) - 1)
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.FirstDayOfWeek"
    Resume PROC_EXIT
End Function
Public Function LastDayOfWeek(ByVal datIn As Date, Optional fDay As Integer = 1) As Date
  ' Comments: Get the last day of the week (Saturday) of the supplied date
  ' Params  : datIn         Date to check the end of the week
  ' Returns : Date of the last day of the week
    On Error GoTo PROC_ERR
  
  LastDayOfWeek = datIn + (7 - Weekday(datIn, fDay))
  
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.LastDayOfWeek"
    Resume PROC_EXIT
End Function

Function doSecurity(Optional bUser As Boolean) As Boolean

If bUser = False Then
    MsgBox "You do not have access to this module. Please contact an administrator.", vbInformation, "No Access"
    doSecurity = False
Else
    doSecurity = True
End If

End Function
Function wsiGetCorrectString(sString)
    wsiGetCorrectString = Trim(Replace(Nz(sString, ""), "'", "''"))
End Function
Public Function RelinkSQLTables2()
    'TVCodeTools ErrorEnablerStart
On Error GoTo PROC_ERR
    'TVCodeTools ErrorEnablerEnd

    'TVCodeTools ErrorHandlerStart

Dim db As Database
Set db = CurrentDb
Dim tdef As TableDef
Dim constr As Variant
'devel Connection string
'constr = "ODBC;DRIVER=SQL Server;SERVER=65.120.138.5,1400;DATABASE=dbZFContact;uid=ZFUser;pwd=!9900!~"
'constr = "ODBC;DRIVER=SQL Server;SERVER=JE_2011_WIN7\SQLEXPRESS;DATABASE=dbZFContact;uid=ZFUser;pwd=!9900!~"
'constr = "ODBC;DRIVER=SQL Server;SERVER=LIGIA-HP\SQLEXPRESS;DATABASE=dbZFContact;uid=sa;pwd=ogbeyonu83"
'constr = "ODBC;DRIVER=SQL Server;SERVER=WIN-DVDU7BN12IF\SQLEXPRESS;DATABASE=dbZFContact;uid=sa;pwd=ogbeyonu83"
constr = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=LAPTOP-HD3LCCKN\MSSQLSERVER2014;DATABASE=dbDakotaSteel;uid=sa;pwd=ogbeyonu83"
constr = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=WSI-SERVER\SQLEXPRESS2014;DATABASE=dbDakotaSteel;uid=sa;pwd=Ogbeyonu83"
'Live connection string
constr = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=DSFP\SQLEXPRESS;DATABASE=dbDakotaSteel;uid=sa;pwd=DSTsa2017"

For Each tdef In db.TableDefs
If InStr(tdef.Connect, "ODBC") Then
    If tdef.Connect <> constr Then
        tdef.Connect = constr
        tdef.RefreshLink
    End If
End If
Next
PROC_EXIT:
    Exit Function

PROC_ERR:
If Err.Number = 3011 Then
    Resume Next
Else
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End If

End Function
Public Function ExportXLS(strQueryName As String) As Boolean
On Error GoTo Err_Rout
Dim intCounter As Integer
Dim strUser As String
strUser = Environ("username")
Repeat:
DoEvents
DoCmd.OutputTo acOutputQuery, strQueryName, acFormatXLS, Application.CurrentProject.path & "\" & strUser & "-TempFile(" & intCounter & ").xls", True
ExportXLS = True
Exit Function

Err_Rout:

If Err.Number = 2302 Then

    intCounter = intCounter + 1
    GoTo Repeat
Else
    MsgBox "An error has ocurred. Error number: " & Err.Number & ". " & Err.Description
    ExportXLS = False
End If
    
End Function



Function wsiSQLConnectString() As String
    wsiSQLConnectString = DFirst("ADOConn", "tblSQLConn")
End Function

Public Function doDeleteSQL(strSQL As String) As Boolean
Dim iConfirm As Integer

iConfirm = MsgBox("Are you sure you want to delete this record? This action can not be undone!", vbYesNo + vbQuestion, "Delete?")

If iConfirm = vbYes Then
    CurrentDb.Execute strSQL, dbSeeChanges
    Screen.ActiveForm.Requery
    doDeleteSQL = True
End If

End Function

Function fAgeYM(StartDate As Date) As String
'Purpose:   Returns the difference between StartDate and Date in full years and months
'Coded by:  raskew
'To call:
' ? fAgeYM(#1/21/04#, #1/19/06#)
'Returns:
' 1 years 11 months

Dim intHold As Integer


   intHold = Int(DateDiff("m", StartDate, Date)) + _
             (Date < DateSerial(Year(Date), Month(Date), Day(Date)))
   
   fAgeYM = Int(intHold / 12) & " years " & intHold Mod 12 & " months "

End Function

Public Function doRefreshSub(strForm As String, strSubForm As String)

    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/10/17 12:53 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    
If IsLoaded(strForm) Then
    Forms(strForm)(strSubForm).Form.Requery
End If

    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function


Public Function doSaveClose()
    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:56 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    
    'check if negotiated rate
    
    
    
    DoCmd.RunCommand acCmdSaveRecord
    DoCmd.Close , , acSaveNo
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    If Err.Number = 2046 Then
        Resume Next
    Else
        MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
        Resume PROC_EXIT
    End If

End Function

Public Function doSaveNew()
    ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    
    DoCmd.RunCommand acCmdSaveRecord
    DoCmd.GoToRecord , , acNewRec
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function

Function doAck(lngID As Long) As String
   ' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    Dim db As dao.Database
    Dim rs As dao.Recordset
    Dim strString As String, strMessage As String
    strSQL = "SELECT tblAlertLogDetail.*, tblUser.UserName FROM tblUser INNER JOIN tblAlertLogDetail ON tblUser.UserID = tblAlertLogDetail.fkUserID Where fkAlertID=" & Nz(lngID, 0)
    'Debug.Print strSQL
    Set db = CurrentDb
    Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
    strMessage = Nz(DLookup("AlertMessage", "tblAlertLog", "AlertID=" & Nz(lngID, 0)), "")
    If Not rs.EOF Then
        Do While Not rs.EOF
            strString = strString & rs!UserName & "(" & Format(rs!Acknowledge, "Yes/No") & ")" & " | "
            rs.MoveNext
        Loop
            strString = Left(strString, Len(strString) - 3)
            doAck = strMessage & " [Notified: " & strString & "]"
    Else
            doAck = strMessage & ""
    End If
Set db = Nothing
Set rs = Nothing
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function
Public Function RowNum(frm As Form) As Variant
On Error GoTo Err_RowNum
    'Purpose:   Numbering the rows on a form.
    'Usage:     Text box with ControlSource of:  =RowNum([Forms]![myForm])
 
    With frm.RecordsetClone
        .Bookmark = frm.Bookmark
        RowNum = .AbsolutePosition + 1
    End With
 
Exit_RowNum:
    Exit Function
 
Err_RowNum:
    If Err.Number <> 3021& Then  'Ignore "No bookmark" at new row.
        Debug.Print "RowNum() error " & Err.Number & " - " & Err.Description
    End If
    RowNum = Null
    Resume Exit_RowNum
End Function
Public Function doLoader(lngID As Long) As String
' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    Dim db As dao.Database
    Dim rs As dao.Recordset
    Dim strSQL As String
    Dim strString As String
    
    Set db = CurrentDb
    strSQL = "SELECT tblDropSheetLoader.*, tlkLoader.Loader FROM tlkLoader RIGHT JOIN tblDropSheetLoader ON tlkLoader.LoaderID = tblDropSheetLoader.fkLoaderID "
    strSQL = strSQL & "Where fkDropSheetID = " & Nz(lngID, 0)
    Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
    
    If Not rs.EOF Then
        Do While Not rs.EOF
            strString = rs!Loader & ", " & strString
            rs.MoveNext
        Loop
        doLoader = Left(strString, Len(strString) - 2)
    Else
        doLoader = ""
    End If

Set db = Nothing
Set rs = Nothing
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function

Function doSONumber(lngID As Long) As String
' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
    On Error GoTo PROC_ERR
    Dim db As dao.Database
    Dim rs As dao.Recordset
    Dim strSQL As String
    Dim strString As String
    Dim strStatus As String
    Set db = CurrentDb
       strSQL = "SELECT tblDropSheetMain.DropSheetID, qryDropSheetCustDetail." & _
             "OrderSONumber " & _
             "FROM (tblDropSheetMain " & _
             "INNER JOIN tblDropSheetCustID ON tblDropSheetMain.DropSheetID = " & _
             "tblDropSheetCustID.fkDropSheetID) " & _
             "INNER JOIN qryDropSheetCustDetail ON tblDropSheetCustID." & _
             "DropSheetCustID = qryDropSheetCustDetail.fkDropSheetCustID Where DropSheetID=" & Nz(lngID, 0)
    'Debug.Print strSQL
    Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
    If Not rs.EOF Then
        Do While Not rs.EOF
            strString = rs!OrderSONumber & ", " & strString
            rs.MoveNext
        Loop
        doSONumber = Left(strString, Len(strString) - 2)
    Else
        doSONumber = ""
    End If
Set db = Nothing
Set rs = Nothing

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function
Function doLoading(lngID As Long) As String
    ' Comments: gets loading status at dropsheet level
    ' Params  :
    ' Returns : String
    ' Created : 02/26/18 16:48 A
    ' Modified:
    
  '  On Error GoTo PROC_ERR
Dim iCountAll As Integer
Dim iCount As Integer

iCountAll = Nz(DCount("*", "qryDropSheetLoadDetail", "DropSheetID=" & lngID), 0)
iCount = Nz(DCount("*", "qryDropSheetLoadDetail", "DropSheetID=" & lngID & " And Scanned=True"), 0)

'get status

If iCountAll = iCount Then
    doLoading = "Loaded"
ElseIf iCount = 0 Then
    doLoading = "Due"
ElseIf iCountAll > iCount Then
    doLoading = "Partial"
Else
    doLoading = "N/A"
End If


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT


End Function
Function doLoadStatus(lngID As Long, intCategory As Integer) As Boolean
        ' Comments: gets loading status at dropsheet level
    ' Params  :
    ' Returns : String
    ' Created : 02/26/18 16:48 A
    ' Modified:
    
    On Error GoTo PROC_ERR
Dim iCountAll As Integer
Dim iCount As Integer

iCountAll = Nz(DCount("*", "qryLogisticsPackagesDetail", "fkLPID=" & lngID & " And CategoryID=" & intCategory), 0)
iCount = Nz(DCount("*", "qryLogisticsPackagesDetail", "fkLPID=" & lngID & " And Scanned=True And CategoryID=" & intCategory), 0)

'get status

If intCategory = 1 And iCount = 0 And iCountAll = 0 Then doLoadStatus = False: Exit Function

If (iCountAll = iCount) Then
    doLoadStatus = True
Else
    doLoadStatus = False
End If


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function

Function doProdStatus(lngID As Long) As String
' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
    'On Error GoTo PROC_ERR
    Dim db As dao.Database
    Dim rs As dao.Recordset
    Dim strSQL As String
    Dim strString As String
    Dim strStatus As String
    Set db = CurrentDb
       strSQL = "SELECT tblDropSheetMain.DropSheetID, qryDropSheetProdDetail." & _
             "* " & _
             "FROM (tblDropSheetMain " & _
             "INNER JOIN tblDropSheetCustID ON tblDropSheetMain.DropSheetID = " & _
             "tblDropSheetCustID.fkDropSheetID) " & _
             "INNER JOIN qryDropSheetProdDetail ON tblDropSheetCustID." & _
             "DropSheetCustID = qryDropSheetProdDetail.fkDropSheetCustID Where DropSheetID=" & Nz(lngID, 0)
    
    
    Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
    If Not rs.EOF Then
        Do While Not rs.EOF
            '
            'If (rs!OrderPartStatus = "BOT" Or rs!OrderRollStatus = "BOT") Then
            '    strString = "BOT"
            '    Exit Do
            'End If
            'If (rs!OrderPartStatus = "BOL" Or rs!OrderRollStatus = "BOL") Then
            '    strString = "BOL"
            '    Exit Do
            'End If
            '
            'If (rs!OrderPartStatus = "REC" Or rs!OrderRollStatus = "REC") Then
            '    strString = "REC"
            '    Exit Do
            'End If
            
            If (rs!OrderPartStatus = "Done" Or rs!OrderPartStatus = "NA") And _
               (rs!OrderSlitterStatus = "Done" Or rs!OrderSlitterStatus = "NA") And _
               (rs!OrderTrimStatus = "Done" Or rs!OrderTrimStatus = "NA") And _
               (rs!OrderRollStatus = "Done" Or rs!OrderRollStatus = "NA") And _
               (rs!OrderWrapStatus = "Done" Or rs!OrderWrapStatus = "NA") And _
               (rs!OrderSoffitStatus = "Done" Or rs!OrderSoffitStatus = "NA") Then
                strString = "Done"
            Else
                strString = "Due"
                Exit Do
            End If
            rs.MoveNext
        Loop
        doProdStatus = strString
    Else
        doProdStatus = "N/A"
    End If

Set db = Nothing
Set rs = Nothing
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function
Function doProdStatusSQL(lngID) As String
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 16:02 A
    ' Modified:
    
    On Error GoTo PROC_ERR
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 13:52 A
    ' Modified:
On Error GoTo PROC_ERR
Dim cnn As ADODB.Connection
Dim rs As ADODB.Recordset
Dim strSQL As String

Set cnn = New ADODB.Connection
cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
cnn.Open
If cnn.State = adStateOpen Then
    strSQL = "SELECT dbo.fnProdStatus(" & Nz(lngID, 0) & ")"
    Set rs = cnn.Execute(strSQL)
    If Not rs.EOF Then doProdStatusSQL = Nz(rs(0).Value, "") Else doProdStatusSQL = ""
End If



PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT


End Function
Function doSumWeight(lngID As Long) As Long
   ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 16:02 A
    ' Modified:
    
   ' On Error GoTo PROC_ERR
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 13:52 A
    ' Modified:
'On Error GoTo PROC_ERR
Dim cnn As ADODB.Connection
Dim rs As ADODB.Recordset
Dim strSQL As String

Set cnn = New ADODB.Connection
cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
cnn.Open
If cnn.State = adStateOpen Then
    strSQL = "SELECT dbo.fnSumWeight(" & Nz(lngID, 0) & ")"
    Set rs = cnn.Execute(strSQL)
    If Not rs.EOF Then doSumWeight = Nz(rs(0).Value, 0) Else doSumWeight = 0
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function
Function doSite(lngID As Long, sSite As Single) As Long
   ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 16:02 A
    ' Modified:
    
   ' On Error GoTo PROC_ERR
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 13:52 A
    ' Modified:
'On Error GoTo PROC_ERR
Dim cnn As ADODB.Connection
Dim rs As ADODB.Recordset
Dim strSQL As String

Set cnn = New ADODB.Connection
cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
cnn.Open
If cnn.State = adStateOpen Then
    strSQL = "SELECT dbo.fnSite(" & Nz(lngID, 0) & "," & sSite & ")"
    Set rs = cnn.Execute(strSQL)
    If Not rs.EOF Then doSite = Nz(rs(0).Value, 0) Else doSite = 0
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function


Function doLoadingSQL(lngID) As String
'
'    ' Comments:
'    ' Params  :
'    ' Returns : String
'    ' Created : 02/28/18 16:02 A
'    ' Modified:
'
'    On Error GoTo PROC_ERR
'    ' Comments:
'    ' Params  :
'    ' Returns : String
'    ' Created : 02/28/18 13:52 A
'    ' Modified:
'On Error GoTo PROC_ERR
'Dim cnn As ADODB.Connection
'Dim rs As ADODB.Recordset
'Dim strSQL As String
'
'Set cnn = New ADODB.Connection
'cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
'cnn.Open
'If cnn.State = adStateOpen Then
'    strSQL = "SELECT dbo.fnLoadStatus(" & Nz(lngID, 0) & ")"
'    Set rs = cnn.Execute(strSQL)
'    If Not rs.EOF Then doLoadingSQL = Nz(rs(0).Value, "") Else doLoadingSQL = ""
'End If
'
'PROC_EXIT:
'    Exit Function
'
'PROC_ERR:
'    MsgBox Err.Number & " " & Err.Description,vbCritical,"Error"
'    Resume PROC_EXIT
End Function
Function doProdOrderStatus(lngID As Long) As String
'
'' Comments:
'    ' Params  :
'    ' Returns :
'    ' Created : 01/12/17 12:57 AD
'    ' Modified:
'
'
'   ' On Error GoTo PROC_ERR
'    Dim db As DAO.Database
'    Dim rs As DAO.Recordset
'    Dim strSQL As String
'    Dim strString As String
'    Dim strStatus As String
'    Set db = CurrentDb
'       strSQL = "Select * from tblOrders Where OrderNumber=" & Nz(lngID, 0)
'   ' Debug.Print strSQL
'    Set rs = db.OpenRecordset(strSQL, dbOpenSnapshot, dbForwardOnly)
'    If Not rs.EOF Then
'        Do While Not rs.EOF
'            If (rs!OrderPartStatus = "Done" Or rs!OrderPartStatus = "NA") And (rs!OrderSlitterStatus = "Done" Or _
'                rs!OrderSlitterStatus = "NA") And (rs!OrderTrimStatus = "Done" Or rs!OrderTrimStatus = "NA") And _
'                (rs!OrderRollStatus = "Done" Or rs!OrderRollStatus = "NA") And (rs!OrderWrapStatus = "Done" Or _
'                rs!OrderWrapStatus = "NA") And (rs!OrderSoffitStatus = "Done" Or rs!OrderSoffitStatus = "NA") Then
'                strString = "Done"
'            Else
'                strString = "Due"
'                Exit Do
'            End If
'            rs.MoveNext
'        Loop
'        doProdOrderStatus = strString
'    Else
'        doProdOrderStatus = ""
'    End If
'Set db = Nothing
'Set rs = Nothing
'
'PROC_EXIT:
'    Exit Function
'
'PROC_ERR:
'    MsgBox Err.Number & " " & Err.Description,vbCritical,"Error"
'    Resume PROC_EXIT

End Function
Function doSecurityMod(ByVal intModule As Integer, ByVal lngUserID As Long) As Integer

    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 08/03/17 15:42 A
    ' Modified:
    
    On Error GoTo PROC_ERR

doSecurityMod = Nz(DLookup("SecurityLevel", "tblUserSecurity", "fkUserID=" & lngUserID & " And Module=" & intModule), 0)


PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
    'TVCodeTools ErrorHandlerEnd

End Function

Function doReorderSONumber(lngID As Long) As String
' Comments:
    ' Params  :
    ' Returns :
    ' Created : 01/12/17 12:57 AD
    ' Modified:
    
    
   ' On Error GoTo PROC_ERR
    Dim db As dao.Database
    Dim rs As dao.Recordset
    Dim strSQL As String
    Dim strString As String
    
    Set db = CurrentDb
           strSQL = "SELECT tblDropSheetCustID.DropSheetCustID, qryDropSheetCustDetailReOrder." & _
             "OrderSONumber " & _
             "FROM tblDropSheetCustID " & _
             "INNER JOIN qryDropSheetCustDetailReOrder ON tblDropSheetCustID." & _
             "DropSheetCustID = qryDropSheetCustDetailReOrder.fkDropSheetCustID " & _
             "WHERE tblDropSheetCustID.DropSheetCustID=" & Nz(lngID, 0)
    Set rs = db.OpenRecordset(strSQL, dbOpenDynaset, dbSeeChanges)
    
    If Not rs.EOF Then
        Do While Not rs.EOF
            strString = rs!OrderSONumber & ", " & strString
            rs.MoveNext
        Loop
        doReorderSONumber = Left(strString, Len(strString) - 2)
    Else
        doReorderSONumber = ""
    End If
Set db = Nothing
Set rs = Nothing

'"INNER JOIN tblDropSheetCustID ON tblDropSheetMain.DropSheetID = " & _
             '"tblDropSheetCustID.fkDropSheetID) " & _ '
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT

End Function


Public Function doSQLExec(strStatement As String, Optional RetValue As Boolean = False) As Variant
    ' Comments: gets loading status at dropsheet level
    ' Params  :
    ' Returns : String
    ' Created : 02/26/18 16:48 A
    ' Modified:
    
    On Error GoTo PROC_ERR
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 02/28/18 16:02 A
    ' Modified:
    
On Error GoTo PROC_ERR
Dim cnn As ADODB.Connection
Dim rs As ADODB.Recordset
Dim strSQL As String

Set cnn = New ADODB.Connection
cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
cnn.Open
If cnn.State = adStateOpen Then
    strSQL = strStatement
    
    If RetValue = True Then
        Set rs = cnn.Execute(strSQL)
        If Not rs.EOF Then doSQLExec = Nz(rs(0).Value, "") Else doSQLExec = "N/A"
    Else
        'cnn.Execute strSQL
        cnn.Execute strSQL, dbSeeChanges
    End If
End If

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & " " & Err.Description, vbCritical, "Error"
    Resume PROC_EXIT
End Function

Public Function FirstDayOfLastWeek(ByVal datIn As Date) As Date
  ' Comments: Get the first day (Sunday) of the week prior to a given date.
  ' Params  : datIn         Date to check
  ' Returns : Date for the first Sunday of the prior week
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  FirstDayOfLastWeek = datIn - 7 - (Weekday(datIn) - 1)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.FirstDayOfLastWeek"
  Resume PROC_EXIT
End Function

Public Function LastDayOfLastWeek(ByVal datIn As Date) As Date
  ' Comments: Get the last day of the week (Saturday) of the previous week.
  ' Params  : datIn         Date to check the end of the week
  ' Returns : Date of the last day of the prior week
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  LastDayOfLastWeek = datIn - Weekday(datIn)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.LastDayOfLastWeek"
  Resume PROC_EXIT
End Function

Public Function MonthFirstDayLastMonth(ByVal datIn As Date) As Date
  ' Comments: Get the first day of the previous month.
  ' Params  : datIn         Date to check
  ' Returns : Date of the first day of the previous month
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  MonthFirstDayLastMonth = DateSerial(Year(datIn), Month(datIn) - 1, 1)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.MonthFirstDayLastMonth"
  Resume PROC_EXIT
End Function

Public Function MonthLastDayLastMonth(ByVal datIn As Date) As Date
  ' Comments: Get the last day of the previous month.
  ' Params  : datIn         Date to check
  ' Returns : Date of the last day of the prior month
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  MonthLastDayLastMonth = DateSerial(Year(datIn), Month(datIn), 0)
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.MonthLastDayLastMonth"
  Resume PROC_EXIT
End Function

Public Function LastQuarterFirstDay(ByVal datIn As Date) As Date
  ' Comments: Get the first day of the quarter for a given date. Quarters start at the beginning of January, April, July, and October.
  ' Params  : datIn         Date to test
  ' Returns : First day of the quarter
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  Dim dbl As Double
  
  LastQuarterFirstDay = DateAdd("q", DatePart("q", datIn) - 2, DateSerial(Year(datIn), 1, 1))
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.QuarterFirstDay"
  Resume PROC_EXIT
End Function

Public Function LastQuarterLastDay(ByVal datIn As Date) As Date
  ' Comments: Get the first day of the quarter for a given date. Quarters start at the beginning of January, April, July, and October.
  ' Params  : datIn         Date to test
  ' Returns : First day of the quarter
  ' Source  : Total Visual SourceBook
  
  On Error GoTo PROC_ERR
  
  Dim dbl As Double
  
  LastQuarterLastDay = DateAdd("q", DatePart("q", datIn) - 1, "1/1/" & Year(datIn)) - 1
  
PROC_EXIT:
  Exit Function

PROC_ERR:
  MsgBox "Error: " & Err.Number & ". " & Err.Description, , "modDateTime.QuarterFirstDay"
  Resume PROC_EXIT
End Function

Public Function FirstDayLastYear() As Date
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 07/20/20 08:38 AD
    ' Modified:
    
    
  On Error GoTo PROC_ERR
    
FirstDayLastYear = DateSerial(Year(Date) - 1, 1, 1)
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basWSIFunctions.FirsDayYear"
    Resume PROC_EXIT



End Function
Public Function LastDayLastYear() As Date
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 07/20/20 08:38 AD
    ' Modified:
    
    
  On Error GoTo PROC_ERR
    
LastDayLastYear = DateSerial(Year(Date) - 1, 12, 31)
    
PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Number & ". " & Err.Description, vbCritical, "basWSIFunctions.FirsDayYear"
    Resume PROC_EXIT



End Function
Public Sub Remove_DBO_Prefix()
 
Dim obj As AccessObject
Dim dbs As Object
 
    Set dbs = Application.CurrentData
 
    'Search for open AccessObject objects in AllTables collection.
   For Each obj In dbs.AllTables
        'If found, remove prefix
       If Left(obj.Name, 4) = "dbo_" Then
            DoCmd.Rename Mid(obj.Name, 5), acTable, obj.Name
        End If
    Next obj
 End Sub