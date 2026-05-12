    '-----------------------------------------------------------------------------
    ' Utilities from http://blog.nkadesign.com/microsoft-access/
    ' (c) Renaud Bompuis, 2008, 2013
    ' Licensed under the Creative Commons Attribution License
    ' http://creativecommons.org/licenses/by/3.0/
    ' http://creativecommons.org/licenses/by/3.0/legalcode
    '
    ' Free for re-use in any application or tutorial providing clear credit
    ' is made about the origin of the code and a link to the site above
    ' is prominently displayed where end-user can access it.
    '-----------------------------------------------------------------------------
    Option Compare Database
    Option Explicit

    ' Buttons in the box replacement become enabled after a 2 second delay by default
    Private Const DEFAULT_BUTTON_DELAY = 2

    ' We add a vbCustom constant to allow custom labels on buttons instead of the standard Dialog.Box arguments
    Public Const vbCustom = 1024

    ' Extend the VbMsgBoxResult so we can also return additonal values if the user has selected custom buttons
    Public Enum VbMsgBoxResultEx
      vbOK = VbMsgBoxResult.vbOK
      vbCancel = VbMsgBoxResult.vbCancel
      vbAbort = VbMsgBoxResult.vbAbort
      vbRetry = VbMsgBoxResult.vbRetry
      vbIgnore = VbMsgBoxResult.vbIgnore
      vbYes = VbMsgBoxResult.vbYes
      vbNo = VbMsgBoxResult.vbNo
      vbBt1 = 101
      vbBt2 = 102
     vbBt3 = 103
 End Enum

    '-----------------------------------------------------------------------------
    ' Useful Win API calls
    '-----------------------------------------------------------------------------
    #If VBA7 Then
      Private Declare PtrSafe Function WinAPISetFocus Lib "user32" Alias "SetFocus" (ByVal hwnd As LongPtr) As Long
    #Else
      Private Declare Function WinAPISetFocus Lib "user32" Alias "SetFocus" (ByVal hwnd As Long) As Long
    #End If


    '-----------------------------------------------------------------------------
    ' Internal fields used to track defaul behaviour of the dialog box
    '-----------------------------------------------------------------------------
    Private m_DefaultTextFileFolder As Variant
    Private m_DefaultButtonDelay As Variant
    Private m_DefaultBeepAllowed As Variant
    Private m_DefaultSaveToFileAllowed As Variant
    Private m_DefaultCopyToClipboardAllowed As Variant
    Private m_Result As VbMsgBoxResultEx

    '-----------------------------------------------------------------------------
    ' The time in seconds to wait until the buttons becomes active on the enhanced dialog
    '-----------------------------------------------------------------------------

    Public Property Get DefaultButtonDelay() As Long
120     If IsEmpty(m_DefaultButtonDelay) Then
            ' Initialize the default value
130         m_DefaultButtonDelay = DEFAULT_BUTTON_DELAY
140     End If
150     DefaultButtonDelay = CLng(m_DefaultButtonDelay)
    End Property

    Public Property Let DefaultButtonDelay(delay As Long)
160     If delay < 0 Then delay = 0
170     m_DefaultButtonDelay = delay
    End Property

    '-----------------------------------------------------------------------------
    ' The default folder where the textfile will be saved
    ' The default value is the path to the folder where the current database is located
    '-----------------------------------------------------------------------------
    Public Property Get DefaultSavedTextFileFolder() As String
180     If IsEmpty(m_DefaultTextFileFolder) Then
190         m_DefaultTextFileFolder = CurrentProject.path & "\"
200     End If
210     DefaultSavedTextFileFolder = m_DefaultTextFileFolder
    End Property

    Public Property Let DefaultSavedTextFileFolder(folderpath As String)
220     m_DefaultTextFileFolder = folderpath
    End Property

    '-----------------------------------------------------------------------------
    ' Whether the button allowing the user to save the message to file should be
    ' displayed or not.
    ' The default is yes.
    '-----------------------------------------------------------------------------
    Public Property Get DefaultSaveToFileAllowed() As Boolean
230     If IsEmpty(m_DefaultSaveToFileAllowed) Then
240         m_DefaultSaveToFileAllowed = True
250     End If
260     DefaultSaveToFileAllowed = m_DefaultSaveToFileAllowed
    End Property

    Public Property Let DefaultSaveToFileAllowed(allow As Boolean)
270     m_DefaultSaveToFileAllowed = allow
    End Property

    '-----------------------------------------------------------------------------
    ' Whether the button allowing the user to copy the message to clipboard is
    ' displayed or not.
    ' The default is yes.
    '-----------------------------------------------------------------------------
    Public Property Get DefaultCopyToClipboardAllowed() As Boolean
280     If IsEmpty(m_DefaultCopyToClipboardAllowed) Then
290         m_DefaultCopyToClipboardAllowed = True
300     End If
310     DefaultCopyToClipboardAllowed = m_DefaultCopyToClipboardAllowed
    End Property

    Public Property Let DefaultCopyToClipboardAllowed(allow As Boolean)
320     m_DefaultCopyToClipboardAllowed = allow
    End Property


    '-----------------------------------------------------------------------------
    ' Whether beeps are allowed or not when the message box opens
    ' The default is yes.
    '-----------------------------------------------------------------------------
    Public Property Get DefaultBeepAllowed() As Boolean
330     If IsEmpty(m_DefaultBeepAllowed) Then
340         m_DefaultBeepAllowed = True
350     End If
360     DefaultBeepAllowed = m_DefaultBeepAllowed
    End Property

    Public Property Let DefaultBeepAllowed(allow As Boolean)
370     m_DefaultBeepAllowed = allow
    End Property

    '-----------------------------------------------------------------------------
    ' The value of teh last result returned by the dialog box
    '-----------------------------------------------------------------------------
    Public Property Get Result() As VbMsgBoxResultEx
380     Result = m_Result
    End Property

    ' Normally., this is not needed, but there are cases where you might want to
    ' manually change the visible result of the DialogBox, for instance if you use
    ' it in another library.
    Public Property Let Result(newResult As VbMsgBoxResultEx)
390     m_Result = newResult
    End Property

    '-----------------------------------------------------------------------------
    ' Plain Text Replacement for the standard MsgBox
    '-----------------------------------------------------------------------------
    Public Function Box(ByVal Prompt As String, _
                           Optional ByVal Buttons As VbMsgBoxStyle = vbOKOnly, _
                           Optional ByVal Title As String, _
                           Optional ByVal HelpFile As String, _
                           Optional ByVal HelpContextId As Long, _
                           Optional ByVal ButtonDelay As Long = -1, _
                           Optional ByVal AllowBeep As Variant, _
                           Optional ByVal AllowCopyToClipboard As Variant, _
                           Optional ByVal AllowSaveToFile As Variant, _
                           Optional ByVal LabelButton1 As Variant = Null, _
                           Optional ByVal LabelButton2 As Variant = Null, _
                           Optional ByVal LabelButton3 As Variant = Null, Optional ByVal LabelInput As Variant = Null) _
                           As VbMsgBoxResultEx
                       
        ' Create the MessageBox
        Dim f As New Form_FormDialog
400     f.ParenthWnd = GetParentWindowHandle()
410     f.Prompt = UnEscStr(Prompt, toHtml:=False)
420     f.Title = Title
430     f.Buttons = Buttons
440     f.HelpFile = HelpFile
450     f.HelpContextId = HelpContextId
460     f.ButtonDelay = IIf(ButtonDelay < 0, DefaultButtonDelay, ButtonDelay)
470     f.AllowBeep = IIf(IsMissing(AllowBeep), DefaultBeepAllowed, AllowBeep)
480     f.AllowCopyToClipboard = IIf(IsMissing(AllowCopyToClipboard), DefaultCopyToClipboardAllowed, AllowCopyToClipboard)
490     f.AllowSaveToFile = IIf(IsMissing(AllowSaveToFile), DefaultSaveToFileAllowed, AllowSaveToFile)
500     f.SavedTextFileFolder = DefaultSavedTextFileFolder
510     f.IsRichText = False
520     f.LabelButton1 = LabelButton1
530     f.LabelButton2 = LabelButton2
540     f.LabelButton3 = LabelButton3
550     f.LabelInput = LabelInput
    
        ' Make it visible and wait forthe user until we get the result
560     Box = f.ShowModal()
    
        ' Keep the last result just in case the user needs it again later
570     m_Result = Box
    
        ' Set focus back to the parent form
580     On Error Resume Next
590     WinAPISetFocus f.ParenthWnd
600     On Error GoTo 0
    
        ' cleanup
610     Set f = Nothing
    
    End Function

    '-----------------------------------------------------------------------------
    ' Rich-Text Replacement for the standard MsgBox
    '-----------------------------------------------------------------------------
    Public Function RichBox(ByVal Prompt As String, _
                           Optional ByVal Buttons As VbMsgBoxStyle = vbOKOnly, _
                           Optional ByVal Title As String, _
                           Optional ByVal HelpFile As String, _
                           Optional ByVal HelpContextId As Long, _
                           Optional ByVal ButtonDelay As Long = -1, _
                           Optional ByVal AllowBeep As Variant, _
                           Optional ByVal AllowCopyToClipboard As Variant, _
                           Optional ByVal AllowSaveToFile As Variant, _
                           Optional ByVal LabelButton1 As Variant = Null, _
                           Optional ByVal LabelButton2 As Variant = Null, _
                           Optional ByVal LabelButton3 As Variant = Null) _
                           As VbMsgBoxResultEx
                       
        ' Create the MessageBox
        Dim f As New Form_FormDialog
620     f.ParenthWnd = GetParentWindowHandle()
630     f.Prompt = UnEscStr(Prompt, toHtml:=True)
640     f.Title = Title
650     f.Buttons = Buttons
660     f.HelpFile = HelpFile
670     f.HelpContextId = HelpContextId
680     f.ButtonDelay = IIf(ButtonDelay < 0, DefaultButtonDelay, ButtonDelay)
690     f.AllowBeep = IIf(IsMissing(AllowBeep), DefaultBeepAllowed, AllowBeep)
700     f.AllowCopyToClipboard = IIf(IsMissing(AllowCopyToClipboard), DefaultCopyToClipboardAllowed, AllowCopyToClipboard)
710     f.AllowSaveToFile = IIf(IsMissing(AllowSaveToFile), DefaultSaveToFileAllowed, AllowSaveToFile)
720     f.SavedTextFileFolder = DefaultSavedTextFileFolder
730     f.IsRichText = True
740     f.LabelButton1 = LabelButton1
750     f.LabelButton2 = LabelButton2
760     f.LabelButton3 = LabelButton3
    
        ' Make it visible and wait forthe user until we get the result
770     RichBox = f.ShowModal()
        
        ' Keep the last result just in case the user needs it again later
780     m_Result = RichBox
    
        ' Set focus back to the parent form
790     On Error Resume Next
800     WinAPISetFocus f.ParenthWnd
810     On Error GoTo 0
    
        ' cleanup
820     Set f = Nothing
    
    End Function


    '-----------------------------------------------------------------------------
    ' Return the hWnd windows handle of the calling form, or default to the main Access window
    ' This is used so we can properly display the dialog on the monitor that contains the
    ' form that opened the dialog box
    '-----------------------------------------------------------------------------
    #If VBA7 Then
        Private Function GetParentWindowHandle() As LongPtr
830         On Error Resume Next
840         GetParentWindowHandle = Screen.ActiveForm.hwnd
850         On Error GoTo 0
860         If GetParentWindowHandle = 0 Then GetParentWindowHandle = Application.hWndAccessApp
        End Function
    #Else
        Private Function GetParentWindowHandle() As Long
870         On Error Resume Next
880         GetParentWindowHandle = Screen.ActiveForm.hwnd
890         On Error GoTo 0
900         If GetParentWindowHandle = 0 Then GetParentWindowHandle = Application.hWndAccessApp
        End Function
    #End If

    '=============================================================================
    ' The following code comes from this article:
    ' http://blog.nkadesign.com/2013/access-using-net-strings-in-vba-for-fun-an-profit/
    ' The code is used to bring support for character litterals and Unicode escape sequences
    ' in the string to be displayed in the message box.
    ' Refer to the article for all details.
    '=============================================================================

    '-----------------------------------------------------------------------------
    ' Takes a string that may contain .Net escaped characters and returns the
    ' un-escaped version of the string.
    ' Note that the only difference with the spec is that we can't escape \" in VBA
    ' so we ignore this particular case.
    ' In .Net, escaped sequences in strings are converted at compile time, so we end-up
    ' with an issue when trying to use our StringBuilder class or sFormat when they contain
    ' special escape chars such as \n or litteral unicode like \u20AC since they will not be
    ' converted to their string representation.
    ' This function solves this problem.
    ' See:
    ' - http://www.codeproject.com/Articles/371232/Escaping-in-Csharp-characters-strings-string-forma
    ' - http://msdn.microsoft.com/en-us/library/aa691087(v=vs.71).aspx
    ' - http://msdn.microsoft.com/en-us/library/aa664669(v=vs.71).aspx
    '-----------------------------------------------------------------------------
    Private Function UnEscStr(ByRef str As Variant, toHtml As Boolean) As String
910     If VarType(str) <> vbString Then Exit Function

        ' To make conversion easy and fast, we store converted character litterals
        ' in a static array so we only need to construct this once.
920     Static escVals(10) As String
930     Static escValsHtml(10) As String
940     Static isInitialised As Boolean
950     If Not isInitialised Then
960         isInitialised = True
970         escVals(1) = "'"
980         escVals(2) = "\"
990         escVals(3) = ChrW$(0)    ' Null
1000            escVals(4) = ChrW$(7)    ' Alert
1010            escVals(5) = ChrW$(8)    ' Backspace
1020            escVals(6) = ChrW$(&HC)  ' Form feed
1030            escVals(7) = vbCrLf      ' New line
1040            escVals(8) = vbCr        ' Carriage return
1050            escVals(9) = vbTab       ' Tab
1060            escVals(10) = ChrW$(&HB) ' Vertical tab
        
1070            escValsHtml(1) = "'"
1080            escValsHtml(2) = "\"
1090            escValsHtml(3) = vbNullString  ' Null
1100            escValsHtml(4) = vbNullString  ' Alert
1110            escValsHtml(5) = vbNullString  ' Backspace
1120            escValsHtml(6) = vbNullString  ' Form feed
1130            escValsHtml(7) = "<br/>"       ' New line
1140            escValsHtml(8) = vbNullString  ' Carriage return
1150            escValsHtml(9) = "&nbsp;&nbsp;&nbsp;&nbsp;"  ' Tab
1160            escValsHtml(10) = vbNullString ' Vertical tab
1170        End If
    
        Dim start As Long, POS As Long, i As Long, u As Long
        Dim c As String, v As String
        Dim l As Integer
1180        start = 1
        ' We'll search for each '\' and
1190        Do
1200            POS = InStr(start, str, "\", vbBinaryCompare)
        
            ' No '\' found, we're finished with this string
1210            If POS = 0 Then
1220                If start = 1 Then
                    ' There was nothing to un-escape at all in the original
                    ' string, so we just return it verbatim.
1230                    UnEscStr = str
1240                Else
                    ' Append the final bit of the original string to the result
1250                    UnEscStr = UnEscStr & Mid$(str, start)
1260                End If
1270                Exit Do
1280            End If
        
            ' Append the bit of string we found before the escaped sequence
1290            UnEscStr = UnEscStr & Mid$(str, start, POS - start)
1300            POS = POS + 1
1310            start = POS + 1
1320            c = Mid$(str, POS, 1)
            ' Search the escaped character in our list of valid ones
1330            i = InStr(1, "'\0abfnrtv", c, vbBinaryCompare)
1340            If i > 0 Then
                ' We found a standard character litteral, just append
                ' its converted version to the result
1350                If toHtml Then
1360                    UnEscStr = UnEscStr & escValsHtml(i)
1370                Else
1380                    UnEscStr = UnEscStr & escVals(i)
1390                End If
1400            Else
                'Deal with Unicode
1410                Select Case AscW(c)
                Case 85  ' U: UTF-32 defined unicode point
                        ' Must have exactly 8 digits
                        ' Get the whole character code point
1430                        u = -1
1440                        On Error Resume Next
1450                        u = CLng("&H" & Mid$(str, start, 8))
1460                        On Error GoTo 0
1470                        If u = -1 Then
                            ' Conversion failed, probably \Uxxx was not a unicode escape sequence but a path, like \Users
                            ' revert and continue
1480                            UnEscStr = UnEscStr & "\U"
1490                        Else
                            ' Converted unicode code point correctly
1500                            If toHtml Then
1510                                v = "&#x" & Hex$(u) & ";"
1520                            Else
1530                                If u < &HFFFF& Then
                                    ' Standard unicode point that fits into UTF-16
1540                                    v = ChrW$(u)
1550                                ElseIf u < &H10FFFF Then
                                    ' We need to convert the UTF-32 into to a UTF-16 surrogate pair
                                    ' See calculation http://www.unicode.org/faq/utf_bom.html#utf16-4
1560                                    v = ChrW$(&HD7C0& + (u \ 1024))
1570                                    UnEscStr = UnEscStr & v
1580                                    v = ChrW$(&HDC00& + (u And &H3FF&))
1590                                End If
1600                            End If
1610                            UnEscStr = UnEscStr & v
1620                            start = start + 8
1630                        End If
                    
1640                    Case 117 ' u: Standard unicode point that fits into UTF-16
1650                        u = -1
1660                        On Error Resume Next
                        ' Must have exactly 4 digits
1670                        u = CLng("&H" & Mid$(str, start, 4))
1680                        On Error GoTo 0
1690                        If u = -1 Then
                            ' Conversion failed, probably \Uxxx was not a unicode escape sequence but a path, like \Users
                            ' revert and continue
1700                            UnEscStr = UnEscStr & "\u"
1710                        Else
1720                            If toHtml Then v = "&#x" & Hex$(u) & ";" Else v = ChrW$(u)
1730                            UnEscStr = UnEscStr & v
1740                            start = start + 4
1750                        End If
                
1760                    Case 120 ' x: Standard unicode point that fits into UTF-16
                        ' Variable length, 1 to 4 digits
1770                        POS = start: l = 0
1780                        Do While InStr(1, "0123456789ABCDEFabcdef", Mid$(str, POS, 1), vbBinaryCompare) > 0 And (l < 4)
1790                            l = l + 1
1800                            POS = POS + 1
1810                        Loop
1820                        u = CLng("&H" & Mid$(str, start, l))
1830                        If toHtml Then v = "&#x" & Hex$(u) & ";" Else v = ChrW$(u)
1840                        UnEscStr = UnEscStr & v
1850                        start = start + l
                
1860                    Case Else
                        ' Unknown escape sequence, just leave it as is in the result
1870                        UnEscStr = UnEscStr & "\" & c
1880                End Select
1890            End If
1900        Loop While True
End Function