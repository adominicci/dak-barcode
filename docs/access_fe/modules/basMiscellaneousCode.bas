Option Compare Database
Option Explicit
Function fOpenForm(ByVal vstrFormName As String, _
    Optional rstrView As String = acNormal, _
    Optional rstrFilterName As String, _
    Optional rstrWhereCondition As String, _
    Optional rvarDataMode As Variant = acFormPropertySettings, _
    Optional rvarWindowMode As Variant = acWindowNormal, _
    Optional rvarOpenArgs As Variant)
'*  Purpose:    A wrapper for the DoCmd.OpenForm method. This allows the developer to make global changes to the way forms are opened
'*              by modifying the code below.
'*  Author:     Peter De Baets
'*  Passed:     vstrForm = name of form
'*              Other arguments are similar to the DoCmd.OpenForm method.

Dim varOpenArgs As Variant
Dim strFilterName As String
Dim strWhereCondition As String
Dim varDataMode As Variant
Dim varWindowMode As Variant
Dim SSIsEnabled As Integer
    
On Error GoTo Err_Section

SSIsEnabled = True
    
If Trim("" & vstrFormName) = "" Then
    GoTo Exit_Section
End If

If IsMissing(rstrFilterName) Then
    strFilterName = ""
Else
    strFilterName = rstrFilterName
End If
    
If IsMissing(rstrWhereCondition) Then
    strWhereCondition = ""
Else
    strWhereCondition = rstrWhereCondition
End If
    
varDataMode = rvarDataMode
    
varWindowMode = rvarWindowMode
    
If IsMissing(rvarOpenArgs) Then
    varOpenArgs = ""
Else
    varOpenArgs = rvarOpenArgs
End If

'* Open the form
If SSIsEnabled Then
    Select Case vstrFormName
    Case "MyFormToSkip"
        '* You can skip ShrinkerStretcher processing for a particular form by including the form name in the "Case"
        '* statement above. You can also disable SS processing for a form by placing the text "SSDisableShrinkStretch"
        '* anywhere in the form tag property.
        DoCmd.OpenForm vstrFormName, rstrView, strFilterName, strWhereCondition, varDataMode, varWindowMode, varOpenArgs
    Case Else
        
        '* Open the form using ShrinkerStretcher
        'SS_OpenForm vstrFormName, rstrView, strFilterName, strWhereCondition, varDataMode, varWindowMode, varOpenArgs
        
        '* Open the form using ShrinkerStretcher OneTimeOnly mode
        SS_OpenForm vstrFormName, rstrView, strFilterName, strWhereCondition, varDataMode, varWindowMode, varOpenArgs & ";Resize=OneTimeOnly"
    
    End Select
Else
    '* Open a form using the standard method
    DoCmd.OpenForm vstrFormName, rstrView, strFilterName, strWhereCondition, varDataMode, varWindowMode, varOpenArgs
End If

Exit_Section:
    On Error Resume Next
    On Error GoTo 0
    Exit Function

Err_Section:
    Select Case Err
    Case 2501
        '* Open form was cancelled
    Case Else
        MsgBox "fOpenForm Error. Form " & vstrFormName & " could not be opened." & _
                vbCrLf & vbCrLf & "Error: " & Err & " - " & Err.Description
    End Select
    
    Resume Exit_Section
    Resume
End Function