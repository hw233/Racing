@echo off
:: ���ÿ���Դ·����Ŀ��·��
set org=D:\Workspace\H5_Develop\H5\Client\bin
set dest=D:\Client_H5

:: ���ÿ���ʱ�ų���Ŀ¼
set ex1=%org%\res\Actors
set ex2=%org%\res\Assets
set ex3=%org%\res\Decorations
set ex4=%org%\res\Equips
set ex5=%org%\res\Library
set ex6=%org%\res\LogicData
set ex7=%org%\res\terrain

:: ִ�п���
robocopy %org% %dest% /MIR /XF H5_CopyClient_Bin2Client.bat /XD %ex1% %ex2% %ex3% %ex4% %ex5% %ex6% %ex7%

pause