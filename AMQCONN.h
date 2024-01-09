/******************************************************************************
 * All right, title and interest in and to the software
 * (the "Software") and the accompanying documentation or
 * materials (the "Documentation"), including all proprietary
 * rights, therein including all patent rights, trade secrets,
 * trademarks and copyrights, shall remain the exclusive
 * property of DXC Technology Company.
 * No interest, license or any right respecting the Software
 * and the Documentation, other than expressly granted in
 * the Software License Agreement, is granted by implication
 * or otherwise.
 *
 * (C) Copyright 2002-2017 DXC Technology Company.
 * All rights reserved.
 ******************************************************************************/
 /******************************************************************************
  *  Chg#    Release  Description
  *
  *  039602  7.2     Enhanced error messages from PX connection
  ******************************************************************************/

#ifndef __STOMP_H__

#define __STOMP_H__ 1

#include "platform.h"

#define MAXNORMNAME 79
#define MAXOBJNAME 255
#define MAXHEADER 300

#define MQ_HOST_VARIABLE	"MQ_HOST"
#define MQ_PORT_VARIABLE	"MQ_PORT"
#define MQ_TIMEOUT_VARIABLE	"MQ_TIMEOUT"
#define MQ_USER_VARIABLE	"MQ_USER"
#define MQ_PASS_VARIABLE	"MQ_PASS"

typedef enum {
    MQ_FUNC_CONN = 0,
    MQ_FUNC_DISC = 1,
    MQ_FUNC_OPEN = 2,
    MQ_FUNC_CLOSE = 3,
    MQ_FUNC_PUT = 4,
    MQ_FUNC_GET = 5
} MQ_FUNC;

typedef enum {
    MQ_RETRN_OK = 0,
    MQ_RETRN_ERR_SOCKET = 1,
    MQ_RETRN_BAD_REQ = 2,
    MQ_RETRN_ERR_CONNECT = 11,
    MQ_RETRN_ERR_DISCONNECT = 12,
    MQ_RETRN_ERR_OPEN = 13,
    MQ_RETRN_ERR_CLOSE = 14,
    MQ_RETRN_ERR_PUT = 15,
    MQ_RETRN_ERR_GET = 16,
    MQ_RETRN_ERR_TIMEOUT = 55,
    MQ_RETRN_ERR_EXCEPTION = 97,
    MQ_RETRN_ERR_LINK = 98,
    MQ_RETRN_INVALD_RQST = 99
} MQ_STATUS;

/********************************************************
 * MQ Connection Factory
 *******************************************************/
typedef struct {
    char        hostname[MAXHOSTNAME];  /* The hostname. POINTER */
    IP_ADDRESS  ip_address;             /* The returned IP Address. PIC S9(8) COMP-5 */
    PORT        port;                   /* PIC S9(18) COMP-5 */
    INT32       timeOut;
    char        user[MAXNORMNAME];
    char        pass[MAXNORMNAME];
} MQ_MGR;

typedef enum {
    MQOT_QUEUE = 1,
    MQOT_TOPIC = 2,
} MQ_OBJ_TYPE;
/********************************************************
 * MQ Object descriptor structure
 *******************************************************/
typedef struct {
    MQ_OBJ_TYPE     object_type;
    char            object_name[MAXNORMNAME];
} MQ_OD;

typedef int                           MQ_OPEN_OPT;

/********************************************************
 * MQ Object structure
 *******************************************************/
typedef struct {
    char            destination[MAXNORMNAME];
    SOCK            sock;
    char            version[MAXNORMNAME];
} MQ_OBJ;

/********************************************************
 * MQ Message descriptor structure
 *******************************************************/
typedef struct {
    char            version[MAXNORMNAME];
    char            destination[MAXNORMNAME];
    char            message_id[MAXOBJNAME];
    char            correlation_id[MAXOBJNAME];
    char            receipt_id[MAXOBJNAME];
} MQ_MD;

/********************************************************
 * MQ Get option
 *******************************************************/
typedef struct {
    int             wait_interval;
    BOOL            client_ack;
} MQ_GO;

/********************************************************
 * MQ Object structure
 *******************************************************/
typedef struct {
    MQ_FUNC         func;
    MQ_MGR          manager;
    MQ_STATUS       status;
    errno_t         err;
    MQ_OD           odesc;
    MQ_GO           gopt;
    MQ_MD           mdesc;
} MQ_HD;
/*
 * Function dispatcher
 */

__declspec(dllexport) void __stdcall AMQCONN(MQ_HD* handler, MQ_OBJ* obj, BYTE* buffer, LENGTH* length);
//
//__declspec(dllexport) void __stdcall MQCONN(MQ_MGR* manager, MQ_STATUS* status, errno_t* err);
//__declspec(dllexport) void __stdcall MQDISC(MQ_MGR* manager, MQ_STATUS* status, errno_t* err);
//__declspec(dllexport) void __stdcall MQOPEN(MQ_MGR* manager, MQ_OD* desc, MQ_OBJ* obj, MQ_STATUS* status, errno_t* err);
//__declspec(dllexport) void __stdcall MQCLOSE(MQ_MGR* manager, MQ_OBJ* obj, MQ_STATUS* status, errno_t* err);
//
//__declspec(dllexport) void __stdcall MQPUT(MQ_MGR* manager, MQ_OBJ* obj, MQ_MD* desc, LENGTH length, BYTE* content, MQ_STATUS* status, errno_t* err);
//__declspec(dllexport) void __stdcall MQGET(MQ_MGR* manager, MQ_OBJ* obj, MQ_GO* options, MQ_MD* desc, BYTE* content, LENGTH* recvLen, MQ_STATUS* status, errno_t* err);

#endif

