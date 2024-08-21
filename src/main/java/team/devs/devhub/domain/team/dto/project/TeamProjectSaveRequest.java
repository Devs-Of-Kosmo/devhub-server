package team.devs.devhub.domain.team.dto.project;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class TeamProjectSaveRequest {

    private Long branchId;
    private Long fromCommitId;
    private List<MultipartFile> files;
    private List<String> deleteFileNameList;
    private List<List<String>> renameFileNameList;
    private String commitMessage;
}
