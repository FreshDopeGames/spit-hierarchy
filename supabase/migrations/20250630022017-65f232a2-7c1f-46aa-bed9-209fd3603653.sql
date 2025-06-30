
-- Standardize U.S. state names to 2-letter postal abbreviations in rapper origins
-- This will update all instances of full state names to their standard abbreviations

-- Alabama
UPDATE rappers SET origin = REPLACE(origin, ', Alabama', ', AL') WHERE origin LIKE '%, Alabama%';
UPDATE rappers SET origin = REPLACE(origin, ' Alabama', ' AL') WHERE origin LIKE '% Alabama%' AND origin NOT LIKE '%, AL%';

-- California  
UPDATE rappers SET origin = REPLACE(origin, ', California', ', CA') WHERE origin LIKE '%, California%';
UPDATE rappers SET origin = REPLACE(origin, ' California', ' CA') WHERE origin LIKE '% California%' AND origin NOT LIKE '%, CA%';

-- Florida
UPDATE rappers SET origin = REPLACE(origin, ', Florida', ', FL') WHERE origin LIKE '%, Florida%';
UPDATE rappers SET origin = REPLACE(origin, ' Florida', ' FL') WHERE origin LIKE '% Florida%' AND origin NOT LIKE '%, FL%';

-- Georgia
UPDATE rappers SET origin = REPLACE(origin, ', Georgia', ', GA') WHERE origin LIKE '%, Georgia%';
UPDATE rappers SET origin = REPLACE(origin, ' Georgia', ' GA') WHERE origin LIKE '% Georgia%' AND origin NOT LIKE '%, GA%';

-- Illinois
UPDATE rappers SET origin = REPLACE(origin, ', Illinois', ', IL') WHERE origin LIKE '%, Illinois%';
UPDATE rappers SET origin = REPLACE(origin, ' Illinois', ' IL') WHERE origin LIKE '% Illinois%' AND origin NOT LIKE '%, IL%';

-- Indiana
UPDATE rappers SET origin = REPLACE(origin, ', Indiana', ', IN') WHERE origin LIKE '%, Indiana%';
UPDATE rappers SET origin = REPLACE(origin, ' Indiana', ' IN') WHERE origin LIKE '% Indiana%' AND origin NOT LIKE '%, IN%';

-- Louisiana
UPDATE rappers SET origin = REPLACE(origin, ', Louisiana', ', LA') WHERE origin LIKE '%, Louisiana%';
UPDATE rappers SET origin = REPLACE(origin, ' Louisiana', ' LA') WHERE origin LIKE '% Louisiana%' AND origin NOT LIKE '%, LA%';

-- Maryland
UPDATE rappers SET origin = REPLACE(origin, ', Maryland', ', MD') WHERE origin LIKE '%, Maryland%';
UPDATE rappers SET origin = REPLACE(origin, ' Maryland', ' MD') WHERE origin LIKE '% Maryland%' AND origin NOT LIKE '%, MD%';

-- Massachusetts
UPDATE rappers SET origin = REPLACE(origin, ', Massachusetts', ', MA') WHERE origin LIKE '%, Massachusetts%';
UPDATE rappers SET origin = REPLACE(origin, ' Massachusetts', ' MA') WHERE origin LIKE '% Massachusetts%' AND origin NOT LIKE '%, MA%';

-- Michigan
UPDATE rappers SET origin = REPLACE(origin, ', Michigan', ', MI') WHERE origin LIKE '%, Michigan%';
UPDATE rappers SET origin = REPLACE(origin, ' Michigan', ' MI') WHERE origin LIKE '% Michigan%' AND origin NOT LIKE '%, MI%';

-- Mississippi
UPDATE rappers SET origin = REPLACE(origin, ', Mississippi', ', MS') WHERE origin LIKE '%, Mississippi%';
UPDATE rappers SET origin = REPLACE(origin, ' Mississippi', ' MS') WHERE origin LIKE '% Mississippi%' AND origin NOT LIKE '%, MS%';

-- Missouri
UPDATE rappers SET origin = REPLACE(origin, ', Missouri', ', MO') WHERE origin LIKE '%, Missouri%';
UPDATE rappers SET origin = REPLACE(origin, ' Missouri', ' MO') WHERE origin LIKE '% Missouri%' AND origin NOT LIKE '%, MO%';

-- Nevada
UPDATE rappers SET origin = REPLACE(origin, ', Nevada', ', NV') WHERE origin LIKE '%, Nevada%';
UPDATE rappers SET origin = REPLACE(origin, ' Nevada', ' NV') WHERE origin LIKE '% Nevada%' AND origin NOT LIKE '%, NV%';

-- New Jersey
UPDATE rappers SET origin = REPLACE(origin, ', New Jersey', ', NJ') WHERE origin LIKE '%, New Jersey%';
UPDATE rappers SET origin = REPLACE(origin, ' New Jersey', ' NJ') WHERE origin LIKE '% New Jersey%' AND origin NOT LIKE '%, NJ%';

-- New York
UPDATE rappers SET origin = REPLACE(origin, ', New York', ', NY') WHERE origin LIKE '%, New York%';
UPDATE rappers SET origin = REPLACE(origin, ' New York', ' NY') WHERE origin LIKE '% New York%' AND origin NOT LIKE '%, NY%';

-- North Carolina
UPDATE rappers SET origin = REPLACE(origin, ', North Carolina', ', NC') WHERE origin LIKE '%, North Carolina%';
UPDATE rappers SET origin = REPLACE(origin, ' North Carolina', ' NC') WHERE origin LIKE '% North Carolina%' AND origin NOT LIKE '%, NC%';

-- North Dakota
UPDATE rappers SET origin = REPLACE(origin, ', North Dakota', ', ND') WHERE origin LIKE '%, North Dakota%';
UPDATE rappers SET origin = REPLACE(origin, ' North Dakota', ' ND') WHERE origin LIKE '% North Dakota%' AND origin NOT LIKE '%, ND%';

-- Ohio
UPDATE rappers SET origin = REPLACE(origin, ', Ohio', ', OH') WHERE origin LIKE '%, Ohio%';
UPDATE rappers SET origin = REPLACE(origin, ' Ohio', ' OH') WHERE origin LIKE '% Ohio%' AND origin NOT LIKE '%, OH%';

-- Pennsylvania
UPDATE rappers SET origin = REPLACE(origin, ', Pennsylvania', ', PA') WHERE origin LIKE '%, Pennsylvania%';
UPDATE rappers SET origin = REPLACE(origin, ' Pennsylvania', ' PA') WHERE origin LIKE '% Pennsylvania%' AND origin NOT LIKE '%, PA%';

-- South Carolina
UPDATE rappers SET origin = REPLACE(origin, ', South Carolina', ', SC') WHERE origin LIKE '%, South Carolina%';
UPDATE rappers SET origin = REPLACE(origin, ' South Carolina', ' SC') WHERE origin LIKE '% South Carolina%' AND origin NOT LIKE '%, SC%';

-- Tennessee
UPDATE rappers SET origin = REPLACE(origin, ', Tennessee', ', TN') WHERE origin LIKE '%, Tennessee%';
UPDATE rappers SET origin = REPLACE(origin, ' Tennessee', ' TN') WHERE origin LIKE '% Tennessee%' AND origin NOT LIKE '%, TN%';

-- Texas
UPDATE rappers SET origin = REPLACE(origin, ', Texas', ', TX') WHERE origin LIKE '%, Texas%';
UPDATE rappers SET origin = REPLACE(origin, ' Texas', ' TX') WHERE origin LIKE '% Texas%' AND origin NOT LIKE '%, TX%';

-- Virginia
UPDATE rappers SET origin = REPLACE(origin, ', Virginia', ', VA') WHERE origin LIKE '%, Virginia%';
UPDATE rappers SET origin = REPLACE(origin, ' Virginia', ' VA') WHERE origin LIKE '% Virginia%' AND origin NOT LIKE '%, VA%';

-- Wisconsin
UPDATE rappers SET origin = REPLACE(origin, ', Wisconsin', ', WI') WHERE origin LIKE '%, Wisconsin%';
UPDATE rappers SET origin = REPLACE(origin, ' Wisconsin', ' WI') WHERE origin LIKE '% Wisconsin%' AND origin NOT LIKE '%, WI%';

-- Connecticut
UPDATE rappers SET origin = REPLACE(origin, ', Connecticut', ', CT') WHERE origin LIKE '%, Connecticut%';
UPDATE rappers SET origin = REPLACE(origin, ' Connecticut', ' CT') WHERE origin LIKE '% Connecticut%' AND origin NOT LIKE '%, CT%';

-- Delaware
UPDATE rappers SET origin = REPLACE(origin, ', Delaware', ', DE') WHERE origin LIKE '%, Delaware%';
UPDATE rappers SET origin = REPLACE(origin, ' Delaware', ' DE') WHERE origin LIKE '% Delaware%' AND origin NOT LIKE '%, DE%';

-- Arkansas
UPDATE rappers SET origin = REPLACE(origin, ', Arkansas', ', AR') WHERE origin LIKE '%, Arkansas%';
UPDATE rappers SET origin = REPLACE(origin, ' Arkansas', ' AR') WHERE origin LIKE '% Arkansas%' AND origin NOT LIKE '%, AR%';

-- Arizona
UPDATE rappers SET origin = REPLACE(origin, ', Arizona', ', AZ') WHERE origin LIKE '%, Arizona%';
UPDATE rappers SET origin = REPLACE(origin, ' Arizona', ' AZ') WHERE origin LIKE '% Arizona%' AND origin NOT LIKE '%, AZ%';

-- Colorado
UPDATE rappers SET origin = REPLACE(origin, ', Colorado', ', CO') WHERE origin LIKE '%, Colorado%';
UPDATE rappers SET origin = REPLACE(origin, ' Colorado', ' CO') WHERE origin LIKE '% Colorado%' AND origin NOT LIKE '%, CO%';

-- Hawaii
UPDATE rappers SET origin = REPLACE(origin, ', Hawaii', ', HI') WHERE origin LIKE '%, Hawaii%';
UPDATE rappers SET origin = REPLACE(origin, ' Hawaii', ' HI') WHERE origin LIKE '% Hawaii%' AND origin NOT LIKE '%, HI%';

-- Idaho
UPDATE rappers SET origin = REPLACE(origin, ', Idaho', ', ID') WHERE origin LIKE '%, Idaho%';
UPDATE rappers SET origin = REPLACE(origin, ' Idaho', ' ID') WHERE origin LIKE '% Idaho%' AND origin NOT LIKE '%, ID%';

-- Iowa
UPDATE rappers SET origin = REPLACE(origin, ', Iowa', ', IA') WHERE origin LIKE '%, Iowa%';
UPDATE rappers SET origin = REPLACE(origin, ' Iowa', ' IA') WHERE origin LIKE '% Iowa%' AND origin NOT LIKE '%, IA%';

-- Kansas
UPDATE rappers SET origin = REPLACE(origin, ', Kansas', ', KS') WHERE origin LIKE '%, Kansas%';
UPDATE rappers SET origin = REPLACE(origin, ' Kansas', ' KS') WHERE origin LIKE '% Kansas%' AND origin NOT LIKE '%, KS%';

-- Kentucky
UPDATE rappers SET origin = REPLACE(origin, ', Kentucky', ', KY') WHERE origin LIKE '%, Kentucky%';
UPDATE rappers SET origin = REPLACE(origin, ' Kentucky', ' KY') WHERE origin LIKE '% Kentucky%' AND origin NOT LIKE '%, KY%';

-- Maine
UPDATE rappers SET origin = REPLACE(origin, ', Maine', ', ME') WHERE origin LIKE '%, Maine%';
UPDATE rappers SET origin = REPLACE(origin, ' Maine', ' ME') WHERE origin LIKE '% Maine%' AND origin NOT LIKE '%, ME%';

-- Minnesota
UPDATE rappers SET origin = REPLACE(origin, ', Minnesota', ', MN') WHERE origin LIKE '%, Minnesota%';
UPDATE rappers SET origin = REPLACE(origin, ' Minnesota', ' MN') WHERE origin LIKE '% Minnesota%' AND origin NOT LIKE '%, MN%';

-- Montana
UPDATE rappers SET origin = REPLACE(origin, ', Montana', ', MT') WHERE origin LIKE '%, Montana%';
UPDATE rappers SET origin = REPLACE(origin, ' Montana', ' MT') WHERE origin LIKE '% Montana%' AND origin NOT LIKE '%, MT%';

-- Nebraska
UPDATE rappers SET origin = REPLACE(origin, ', Nebraska', ', NE') WHERE origin LIKE '%, Nebraska%';
UPDATE rappers SET origin = REPLACE(origin, ' Nebraska', ' NE') WHERE origin LIKE '% Nebraska%' AND origin NOT LIKE '%, NE%';

-- New Hampshire
UPDATE rappers SET origin = REPLACE(origin, ', New Hampshire', ', NH') WHERE origin LIKE '%, New Hampshire%';
UPDATE rappers SET origin = REPLACE(origin, ' New Hampshire', ' NH') WHERE origin LIKE '% New Hampshire%' AND origin NOT LIKE '%, NH%';

-- New Mexico
UPDATE rappers SET origin = REPLACE(origin, ', New Mexico', ', NM') WHERE origin LIKE '%, New Mexico%';
UPDATE rappers SET origin = REPLACE(origin, ' New Mexico', ' NM') WHERE origin LIKE '% New Mexico%' AND origin NOT LIKE '%, NM%';

-- Oklahoma
UPDATE rappers SET origin = REPLACE(origin, ', Oklahoma', ', OK') WHERE origin LIKE '%, Oklahoma%';
UPDATE rappers SET origin = REPLACE(origin, ' Oklahoma', ' OK') WHERE origin LIKE '% Oklahoma%' AND origin NOT LIKE '%, OK%';

-- Oregon
UPDATE rappers SET origin = REPLACE(origin, ', Oregon', ', OR') WHERE origin LIKE '%, Oregon%';
UPDATE rappers SET origin = REPLACE(origin, ' Oregon', ' OR') WHERE origin LIKE '% Oregon%' AND origin NOT LIKE '%, OR%';

-- Rhode Island
UPDATE rappers SET origin = REPLACE(origin, ', Rhode Island', ', RI') WHERE origin LIKE '%, Rhode Island%';
UPDATE rappers SET origin = REPLACE(origin, ' Rhode Island', ' RI') WHERE origin LIKE '% Rhode Island%' AND origin NOT LIKE '%, RI%';

-- South Dakota
UPDATE rappers SET origin = REPLACE(origin, ', South Dakota', ', SD') WHERE origin LIKE '%, South Dakota%';
UPDATE rappers SET origin = REPLACE(origin, ' South Dakota', ' SD') WHERE origin LIKE '% South Dakota%' AND origin NOT LIKE '%, SD%';

-- Utah
UPDATE rappers SET origin = REPLACE(origin, ', Utah', ', UT') WHERE origin LIKE '%, Utah%';
UPDATE rappers SET origin = REPLACE(origin, ' Utah', ' UT') WHERE origin LIKE '% Utah%' AND origin NOT LIKE '%, UT%';

-- Vermont
UPDATE rappers SET origin = REPLACE(origin, ', Vermont', ', VT') WHERE origin LIKE '%, Vermont%';
UPDATE rappers SET origin = REPLACE(origin, ' Vermont', ' VT') WHERE origin LIKE '% Vermont%' AND origin NOT LIKE '%, VT%';

-- Washington
UPDATE rappers SET origin = REPLACE(origin, ', Washington', ', WA') WHERE origin LIKE '%, Washington%' AND origin NOT LIKE '%Washington, DC%';
UPDATE rappers SET origin = REPLACE(origin, ' Washington', ' WA') WHERE origin LIKE '% Washington%' AND origin NOT LIKE '%, WA%' AND origin NOT LIKE '%Washington, DC%';

-- West Virginia
UPDATE rappers SET origin = REPLACE(origin, ', West Virginia', ', WV') WHERE origin LIKE '%, West Virginia%';
UPDATE rappers SET origin = REPLACE(origin, ' West Virginia', ' WV') WHERE origin LIKE '% West Virginia%' AND origin NOT LIKE '%, WV%';

-- Wyoming
UPDATE rappers SET origin = REPLACE(origin, ', Wyoming', ', WY') WHERE origin LIKE '%, Wyoming%';
UPDATE rappers SET origin = REPLACE(origin, ' Wyoming', ' WY') WHERE origin LIKE '% Wyoming%' AND origin NOT LIKE '%, WY%';

-- Special case: Washington, D.C. should remain as Washington, DC (already correct format)
-- Alaska
UPDATE rappers SET origin = REPLACE(origin, ', Alaska', ', AK') WHERE origin LIKE '%, Alaska%';
UPDATE rappers SET origin = REPLACE(origin, ' Alaska', ' AK') WHERE origin LIKE '% Alaska%' AND origin NOT LIKE '%, AK%';

-- Update the updated_at timestamp for affected records
UPDATE rappers SET updated_at = NOW() WHERE origin ~ '(, |^)(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)($| )';
