
# Markdown Tabelle


| Auswahl                                                                 | Selektor                        |
|-------------------------------------------------------------------------|---------------------------------|
| Alle p-Elemente                                                         | p                               |
| Alle Links der Navigation                                               | nav a                           |
| Alle Elemente unterhalb des Elements main                               | main *                          |
| Den Link im Navigationselement mit der Klasse active                    | nav li.active a                 |
| Das Element mit der id ads                                              | #ads                            |
| Alle Überschriften                                                      | h1, h2, h3, h4, h5, h6          |
| Alle h1- oder h2-Überschriften direkt unter einem section-Element       | section > h1, section > h2      |
| Alle a-Elemente die mindestens zwei Stufen unter einer section liegen   | section * a                     |
| Den ersten Link in der Navigation                                       | nav li:first-child a            |
| Den vierten Link in der Navigation (mit Hilfe des + -Selektors)         | li:first-child + li + li + li a |
| Den vierten Link in der Navigation (mit Hilfe des :nth-child-Selektors) | li:nth-child(4) a               |
| Den ersten Absatz im main-Bereich                                       | main p:first-of-type            |
| Alle Elemente mit einem alt-Attribut                                    | [alt]                           |
| Alle PNG-Bilder im Dokument                                             | [src$=".png"]                   |
| Jedes zweite li-Element im Navigationsbereich                           | nav li:nth-child(2n)            |




