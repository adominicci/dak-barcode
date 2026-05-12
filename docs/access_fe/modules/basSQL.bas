Option Compare Database
Function doRDS()
    If IsLoaded("frmSQLConn") Then Forms!frmSQLConn!lstConn.RowSource = "Select * from tblSQLLoc"
End Function
Function AttachDSNLessTable(stLocalTableName As String, stRemoteTableName As String, stServer As String, stDatabase As String, Optional stUsername As String, Optional stPassword As String)
     On Error GoTo AttachDSNLessTable_Err
    Dim TD As TableDef
    Dim stConnect As String
    
    For Each TD In CurrentDb.TableDefs
        If TD.Name = stLocalTableName Then
            CurrentDb.TableDefs.Delete stLocalTableName
        End If
    Next
      
    If Len(stUsername) = 0 Then
        '//Use trusted authentication if stUsername is not supplied.
        stConnect = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=" & stServer & ";DATABASE=" & stDatabase & ";Trusted_Connection=Yes"
    Else
        '//WARNING: This will save the username and the password with the linked table information.
        stConnect = "ODBC;DRIVER=SQL Server Native Client 11.0;SERVER=" & stServer & ";DATABASE=" & stDatabase & ";UID=" & stUsername & ";PWD=" & stPassword
    End If
    Set TD = CurrentDb.CreateTableDef(stLocalTableName, dbAttachSavePWD, stRemoteTableName, stConnect)
    CurrentDb.TableDefs.Append TD
    AttachDSNLessTable = True
    Exit Function

AttachDSNLessTable_Err:
    
    AttachDSNLessTable = False
    MsgBox "AttachDSNLessTable encountered an unexpected error: " & Err.Description

End Function


Public Function doAutoexec()
On Error Resume Next
    DoEvents
    If SysCmd(acSysCmdRuntime) = False Then DoCmd.RunCommand acCmdWindowHide
    If RelinkSQLTables = True Then
        'CurrentDb.Execute "CREATE UNIQUE INDEX NewIndex On vwProductionAlt (OrderNumber)"
        'CurrentDb.Execute "CREATE UNIQUE INDEX NewIndex2 On vwProductionDefault (OrderNumber)"
    On Error GoTo Autoexec_Err
        DoCmd.OpenForm "fmnMainMenu"
        Call doToolBar(2)
        'SS_OpenForm "fmnMainMenu", , , , , , "OrigWd=1900;OrigHt=1200"

    Else
        MsgBox "Error connecting to SQL backend", vbCritical, "Error"
        'DoCmd.OpenForm "frmSQLConn"
        
    End If


Autoexec_Exit:
    Exit Function

Autoexec_Err:
    MsgBox "Encountered error number: " & Err.Number & ". " & Err.Description, vbCritical, "Error"
    Resume Autoexec_Exit
End Function

Public Function RelinkSQLTables() As Boolean
    'TVCodeTools ErrorEnablerStart
On Error GoTo PROC_ERR
    'TVCodeTools ErrorEnablerEnd

    'TVCodeTools ErrorHandlerStart

Dim db As dao.Database
Set db = CurrentDb
Dim tdef As TableDef
Dim qdef As QueryDef
Dim constr As Variant
Dim cnn As ADODB.Connection
Set cnn = New ADODB.Connection
cnn.ConnectionString = DFirst("ADOConn", "tblSQLConn")
cnn.ConnectionTimeout = 15

cnn.Open

If cnn.State = adStateOpen Then
'First test connection via ado



constr = DFirst("SQLConn", "tblSQLConn")
'Debug.Print constr
'Live connection string

For Each tdef In db.TableDefs
'Debug.Print tdef.Name
If InStr(tdef.Connect, "ODBC") And Left(tdef.Name, 6) <> "public" And Left(tdef.Name, 3) <> "qbo" Then
    If tdef.Connect <> constr Then
        tdef.Connect = constr
        tdef.RefreshLink
    End If
ElseIf InStr(tdef.Connect, "ODBC") And Left(tdef.Name, 6) <> "public" And Left(tdef.Name, 3) = "qbo" Then
    If tdef.Connect <> constr Then
        tdef.Connect = Replace(constr, "dbDakotaSteel", "DSTQBooks")
        tdef.RefreshLink
    End If
End If
Next

For Each qdef In db.QueryDefs
    If qdef.Type = dbQSQLPassThrough Then
        If qdef.Connect <> constr Then
            qdef.Connect = constr
        End If
    End If

Next

CurrentDb.Execute "ALTER TABLE qryBarCode ADD CONSTRAINT PK PRIMARY KEY (LPIDDetail)"
'CurrentDb.Execute "CREATE INDEX NEWINDEX ON vwCustomerTree (ParentName)"

RelinkSQLTables = True

End If


PROC_EXIT:
    Exit Function

PROC_ERR:
If Err.Number = 3011 Or Err.Number = 3283 Or Err.Number = 3284 Then
    Debug.Print Err.Number
    
   ' MsgBox Err.Number & ". " & Err.Description
    Resume Next
Else
    RelinkSQLTables = False
    DoCmd.OpenForm "frmSQLConn"
    'MsgBox Err.Number & " - " & Err.Description, vbCritical, "mdlFunctions.RelinkSQLTablesBE"
    'Resume PROC_EXIT
End If
End Function

Public Function ExecSQL(sSQL As String) As Boolean


Dim cnn As ADODB.Connection
    Set cnn = New ADODB.Connection
    cnn.ConnectionString = wsiSQLConnectString
    cnn.Open
    ' Find out if the attempt to connect worked.
    If cnn.State = adStateOpen Then
        'Debug.Print sSQL
        cnn.Execute (sSQL)
        ExecSQL = True
    Else
        MsgBox "ExecSQl Error;" & sSQL
    End If

    ' Close the connection.
    cnn.Close
End Function

Public Function ExecScalar(sSQL As String) As Variant

    ' Find out if the attempt to connect worked.
    Dim cnn As ADODB.Connection
    Set cnn = New ADODB.Connection
    cnn.ConnectionString = wsiSQLConnectString
    cnn.Open
    If cnn.State = adStateOpen Then
        Dim rs As New ADODB.Recordset
        Set rs = cnn.Execute(sSQL)
        If Not rs.EOF Then
        
            ExecScalar = rs(0) 'This procedure assumes that in an execscalar situation, the stored procedure is only returning one value in one field
        Else
            ExecScalar = 0
        End If
        rs.Close
        Set rs = Nothing
    Else
        MsgBox "ExecScalar Error;" & sSQL
    End If

    ' Close the connection.
    'cnn.Close
End Function
Public Function OpenConnect()
    ' Comments:
    ' Params  :
    ' Returns : String
    ' Created : 09/05/19 16:35 A
    ' Modified:
    
    'On Error GoTo PROC_ERR
Dim frm As AccessObject

For Each frm In CurrentProject.AllForms
    If IsLoaded(frm.Name) Then DoCmd.Close acForm, frm.Name, acSaveNo
    DoEvents
Next

DoCmd.OpenForm "frmSQLConn"

PROC_EXIT:
    Exit Function

PROC_ERR:
    MsgBox Err.Description, vbCritical, "modWSI.openConnect"
    Resume PROC_EXIT


End Function