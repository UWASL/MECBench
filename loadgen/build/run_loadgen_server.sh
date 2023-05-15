source ./setup_tc.sh $@

set -- ${NONTC[@]}

python3 loadgen_server.py
